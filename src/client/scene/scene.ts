import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Block as SubstrateBlock, SignedBlock } from "@polkadot/types/interfaces";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { Block } from "../model/app/block";
import { ValidatorSummary, ValidatorSummaryDiff } from "../model/subvt/validator_summary";
import AsyncLock = require("async-lock");
import { Constants } from "../util/constants";
import { NetworkStatus, NetworkStatusDiff } from "../model/subvt/network_status";
import { NetworkStatusBoard } from "../ui/network_status_board";
import { ValidatorMesh } from "../ui/validator_mesh";
import { ValidatorList, ValidatorListDelegate } from "../ui/validator_list";
import { ValidatorSummaryBoard } from "../ui/validator_summary_board";
import { Validator } from "../model/app/validator";
import { cloneJSONSafeArray, cloneJSONSafeObject } from "../util/object";
import {
    ValidatorDetailsBoard,
    ValidatorDetailsBoardDelegate,
} from "../ui/validator_details_board";
import { HeaderExtended } from "@polkadot/api-derive/types";
import Visibility = require("visibilityjs");
import { createTween } from "../util/tween";

class ChainVizScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;

    private readonly raycaster: THREE.Raycaster;
    private readonly hoverPoint: THREE.Vector2 = new THREE.Vector2();

    private readonly blocks = new Array<Block>();
    private readonly maxLength = 13;

    private validatorMesh!: ValidatorMesh;
    private validatorsInited = false;
    private validatorList: ValidatorList;
    private readonly validatorSummaryBoard: ValidatorSummaryBoard;
    private readonly validatorDetailsBoard: ValidatorDetailsBoard;
    private networkStatusBoard!: NetworkStatusBoard;

    private readonly lock = new AsyncLock();
    private readonly blockPushLockKey = "block_push";

    private readonly leftPanel = <HTMLElement>document.getElementById("left-panel");
    private mouseIsInLeftPanel = false;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(
            Constants.CAMERA_START_POSITION.x,
            Constants.CAMERA_START_POSITION.y,
            Constants.CAMERA_START_POSITION.z
        );
        this.camera.lookAt(new THREE.Vector3());

        // axes helper :: x is red, y is green, z is blue
        const _axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        this.addLights();
        // raycaster
        this.raycaster = new THREE.Raycaster();
        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        document.addEventListener("click", (event) => {
            this.onClick(event);
        });
        document.addEventListener("mousemove", (event) => {
            this.onMouseMove(event);
        });
        this.leftPanel.addEventListener("mouseenter", (_event) => {
            if (this.validatorMesh) {
                this.validatorMesh.clearHover();
            }
            this.mouseIsInLeftPanel = true;
        });
        this.leftPanel.addEventListener("mouseleave", (_event) => {
            this.mouseIsInLeftPanel = false;
        });

        // stats
        this.stats = Stats();
        //document.body.appendChild(this.stats.dom);
        //this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        // orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        this.limitOrbitControls();
        window.addEventListener(
            "resize",
            () => {
                this.onWindowResize();
            },
            false
        );
        // validator list
        this.validatorList = new ValidatorList(<ValidatorListDelegate>{
            onMouseOver: (accountIdHex) => {
                const index = this.validatorMesh.getIndexOf(accountIdHex);
                if (index) {
                    const _validator = this.validatorMesh.hover(index);
                }
            },
            onMouseLeave: (_accountIdHex) => {
                this.validatorMesh.clearHover();
                this.validatorSummaryBoard.close();
            },
            onClick: (accountIdHex) => {
                const index = this.validatorMesh.getIndexOf(accountIdHex);
                if (index) {
                    const validator = this.validatorMesh.select(index);
                    if (validator) {
                        this.validatorDetailsBoard.show(
                            cloneJSONSafeObject(validator.getSummary())
                        );
                        this.validatorSummaryBoard.close();
                    }
                }
            },
        });
        this.validatorSummaryBoard = new ValidatorSummaryBoard();
        this.validatorDetailsBoard = new ValidatorDetailsBoard(<ValidatorDetailsBoardDelegate>{
            onClose: (_accountIdHex) => {
                this.validatorMesh.clearSelection();
            },
        });
    }

    private resetCamera() {
        if (Visibility.hidden()) {
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.camera.position.z = Constants.ORBIT_DEFAULT_DISTANCE;
            return;
        }

        createTween(
            this.camera.position,
            {
                x: 0,
                y: 0,
                z: Constants.ORBIT_DEFAULT_DISTANCE,
            },
            Constants.CAMERA_RESET_ANIM_CURVE,
            Constants.CAMERA_RESET_ANIM_LENGTH_MS,
            undefined,
            undefined,
            () => {
                this.camera.rotation.x = 0;
                this.camera.rotation.y = 0;
                this.camera.rotation.z = 0;
                this.controls.enabled = true;
            }
        ).start();
    }

    private addLights() {
        // point light front
        {
            const pointLight = new THREE.PointLight(0x404040);
            pointLight.intensity = 1.0;
            pointLight.position.x = 60;
            pointLight.position.y = 60;
            pointLight.position.z = 30;
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        }
        // point light back
        {
            const pointLight = new THREE.PointLight(0x404040);
            pointLight.intensity = 1.0;
            pointLight.position.x = -20;
            pointLight.position.y = -40;
            pointLight.position.z = -30;
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        }
        // ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
    }

    private limitOrbitControls() {
        this.controls.minPolarAngle = Constants.ORBIT_MIN_POLAR_ANGLE;
        this.controls.maxPolarAngle = Constants.ORBIT_MAX_POLAR_ANGLE;
        this.controls.minAzimuthAngle = Constants.ORBIT_MIN_AZIMUTH_ANGLE;
        this.controls.maxAzimuthAngle = Constants.ORBIT_MAX_AZIMUTH_ANGLE;
        this.controls.minDistance = Constants.ORBIT_MIN_DISTANCE;
        this.controls.maxDistance = Constants.ORBIT_MAX_DISTANCE;
        this.controls.screenSpacePanning = true;
        const minPan = new THREE.Vector3(-Constants.ORBIT_MAX_PAN_X, -Constants.ORBIT_MAX_PAN_Y, 0);
        const maxPan = new THREE.Vector3(Constants.ORBIT_MAX_PAN_X, Constants.ORBIT_MAX_PAN_Y, 0);
        const _v = new THREE.Vector3();
        this.controls.addEventListener("change", () => {
            _v.copy(this.controls.target);
            this.controls.target.clamp(minPan, maxPan);
            _v.sub(this.controls.target);
            this.camera.position.sub(_v);
        });
    }

    private onClick(event: MouseEvent) {
        if (this.mouseIsInLeftPanel) {
            return;
        }
        const clickPoint = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        this.raycaster.setFromCamera(clickPoint, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);
        const index = intersects.length > 0 ? intersects[0].instanceId : undefined;
        if (index) {
            if (index == this.validatorMesh.getSelectedValidatorIndex()) {
                this.validatorDetailsBoard.close();
                this.validatorMesh.clearSelection();
            } else {
                const validator = this.validatorMesh.select(index);
                if (validator) {
                    this.validatorDetailsBoard.show(cloneJSONSafeObject(validator.getSummary()));
                    this.validatorSummaryBoard.close();
                }
            }
        }
    }

    private onMouseMove(event: MouseEvent) {
        this.hoverPoint.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.hoverPoint.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    private animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        this.controls.update();
        this.render();
        TWEEN.update();
        this.stats.update();
    }

    private setPointerCursor() {
        document.getElementsByTagName("html")[0].style.cursor = "pointer";
    }

    private setDefaultCursor() {
        document.getElementsByTagName("html")[0].style.cursor = "default";
    }

    private checkHoverRaycast() {
        if (this.mouseIsInLeftPanel || !this.controls.enabled) {
            return;
        }
        this.raycaster.setFromCamera(this.hoverPoint, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);
        const index = intersects.length > 0 ? intersects[0].instanceId : undefined;
        const validator = index ? this.validatorMesh.hover(index) : undefined;
        if (index && validator && !validator.isAuthoring()) {
            this.setPointerCursor();
            if (!this.validatorMesh.isSelected(index)) {
                this.showValidatorSummaryBoard(index, validator);
            }
        } else {
            this.validatorMesh.clearHover();
            this.setDefaultCursor();
            this.validatorSummaryBoard.close();
        }
    }

    private showValidatorSummaryBoard(index: number, validator: Validator) {
        const position = this.validatorMesh.getOnScreenPositionOfItem(
            index,
            this.renderer,
            this.camera
        );
        this.validatorSummaryBoard.show(cloneJSONSafeObject(validator.getSummary()));
        this.validatorSummaryBoard.setPosition(position.x, position.y);
    }

    private render() {
        if (this.validatorsInited) {
            this.checkHoverRaycast();
        }
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.addChainRing();
        this.animate();
    }

    private addChainRing() {
        const geometry = new THREE.RingGeometry(
            18,
            19,
            120,
            1,
            Math.PI + Math.PI / 12,
            (Math.PI * 11) / 6
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0x6d7379,
            side: THREE.DoubleSide,
        });
        this.scene.add(new THREE.Mesh(geometry, material));
    }

    async initValidators(summaries: Array<ValidatorSummary>) {
        summaries.sort((a, b) => {
            if (a.isParaValidator && !b.isParaValidator) {
                return 1;
            } else if (!a.isParaValidator && b.isParaValidator) {
                return -1;
            } else {
                return 0;
            }
        });
        this.validatorMesh = new ValidatorMesh(summaries.length);
        await this.validatorMesh.addTo(this.scene, cloneJSONSafeArray(summaries));
        this.validatorList.init(cloneJSONSafeArray(summaries));
        this.validatorsInited = true;
    }

    async initBlocks(signedBlocks: Array<SignedBlock>) {
        for (let i = signedBlocks.length - 1; i >= 0; i--) {
            const block = new Block(signedBlocks[i].block);
            this.blocks.unshift(block);
            block.addTo(this.scene);
            block.setIndex(i, true);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
        }
        setTimeout(() => {
            this.resetCamera();
        }, 0);
    }

    private getBlockWithNumber(number: number): Block | undefined {
        return this.blocks.find((block) => {
            return block.getNumber() == number;
        });
    }

    private hasBlockWithHash(hashHex: string): boolean {
        return (
            this.blocks.filter((block) => {
                return block.getHashHex() == hashHex;
            }).length > 0
        );
    }

    getChainTipHex(): string {
        return this.blocks[0].getHashHex();
    }

    async onNewBlock(block: SubstrateBlock, header: HeaderExtended) {
        if (this.networkStatusBoard) {
            this.networkStatusBoard.setBestBlockNumber(header.number.toNumber());
        }
        this.pushBlock(block, header.author?.toHex());
    }

    async pushBlock(substrateBlock: SubstrateBlock, authorAccountIdHex?: string) {
        if (this.hasBlockWithHash(substrateBlock.header.hash.toHex())) {
            // skip duplicate block
            return;
        }
        if (Visibility.hidden()) {
            const newBlock = new Block(substrateBlock);
            const blockNumber = substrateBlock.header.number.toNumber();
            const sibling = this.getBlockWithNumber(blockNumber);
            this.blocks.unshift(newBlock);
            if (sibling) {
                sibling.setSibling(newBlock);
                newBlock.setSibling(sibling);
                sibling.fork(false);
            } else {
                for (let i = 1; i < this.blocks.length; i++) {
                    const block = this.blocks[i];
                    block.setIndex(block.getIndex() + 1, false);
                }
            }
            newBlock.addTo(this.scene);
            this.removeOffScreenValidators();
            return;
        }
        this.lock.acquire(
            this.blockPushLockKey,
            (done) => {
                const newBlock = new Block(substrateBlock);
                const blockNumber = substrateBlock.header.number.toNumber();
                const sibling = this.getBlockWithNumber(blockNumber);
                this.blocks.unshift(newBlock);
                const authorshipBegan = this.validatorMesh.beginAuthorship(
                    authorAccountIdHex,
                    (validator) => {
                        if (sibling) {
                            sibling.setSibling(newBlock);
                            newBlock.setSibling(sibling);
                            sibling.fork(true);
                        } else {
                            for (let i = 1; i < this.blocks.length; i++) {
                                const block = this.blocks[i];
                                block.setIndex(block.getIndex() + 1, true);
                            }
                        }
                        setTimeout(() => {
                            newBlock.spawn(this.scene, validator.index, validator.ringSize, () => {
                                this.removeOffScreenValidators();
                                done();
                            });
                            setTimeout(() => {
                                this.validatorMesh.endAuthorship();
                            }, Constants.VALIDATOR_AUTHORSHIP_END_DELAY);
                        }, Constants.BLOCK_SPAWN_DELAY);
                    }
                );
                if (!authorshipBegan) {
                    // shift blocks
                    for (const block of this.blocks) {
                        block.setIndex(block.getIndex() + 1, true);
                    }
                    // insert block
                    setTimeout(() => {
                        newBlock.addTo(this.scene);
                        done();
                    }, Constants.BLOCK_SHIFT_TIME_MS);
                }
            },
            (_err, _) => {
                // lock released
            }
        );
    }

    private removeOffScreenValidators() {
        const max = this.blocks[0].getNumber();
        const min = this.blocks[this.blocks.length - 1].getNumber();
        for (let i = min; i <= max - this.maxLength; i++) {
            while (this.blocks[this.blocks.length - 1].getNumber() == i) {
                const blockToRemove = this.blocks.pop();
                blockToRemove?.removeAndDispose();
            }
        }
    }

    onFinalizedBlock(hash: string, number?: number) {
        if (number && this.networkStatusBoard) {
            this.networkStatusBoard.setFinalizedBlockNumber(number);
        }
        const finalizedBlock = this.blocks.find((block) => {
            return hash == block.getHashHex();
        });
        if (finalizedBlock) {
            finalizedBlock.finalize(!Visibility.hidden());
            this.onFinalizedBlock(finalizedBlock.getParentHashHex());
        } else {
            return;
        }
    }

    initNetworkStatus(status: NetworkStatus) {
        this.networkStatusBoard = new NetworkStatusBoard(cloneJSONSafeObject(status));
    }

    updateNetworkStatus(diff: NetworkStatusDiff) {
        this.networkStatusBoard.update(diff);
    }

    updateValidators(diffs: Array<ValidatorSummaryDiff>) {
        for (const diff of diffs) {
            this.validatorDetailsBoard.update(diff);
            this.validatorSummaryBoard.update(diff);
            this.validatorMesh?.update(diff);
        }
    }

    removeValidators(accountsIds: Array<string>) {
        for (const accountIdHex of accountsIds) {
            this.validatorDetailsBoard.remove(accountIdHex);
            this.validatorSummaryBoard.remove(accountIdHex);
            this.validatorMesh.remove(accountIdHex);
            this.validatorList.remove(accountIdHex);
        }
    }

    insertValidators(summaries: Array<ValidatorSummary>) {
        for (const summary of summaries) {
            this.validatorMesh.insert(summary);
            this.validatorList.insert(summary);
        }
    }
}

export { ChainVizScene };
