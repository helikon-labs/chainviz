import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Block as SubstrateBlock, Header, SignedBlock } from "@polkadot/types/interfaces";
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
import { ApiPromise } from "@polkadot/api";

class ChainVizScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;

    private readonly raycaster: THREE.Raycaster;
    private readonly hoverPoint: THREE.Vector2 = new THREE.Vector2();

    private readonly blocks = new Array<Block>();
    private readonly maxBlocks = 13;

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
        // init font loader

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = Constants.ORBIT_DEFAULT_DISTANCE;
        // axes helper :: x is red, y is green, z is blue
        const _axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        this.addLights();
        // raycaster
        this.raycaster = new THREE.Raycaster();
        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.domElement.addEventListener;
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
        document.body.appendChild(this.stats.dom);
        this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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
                this.validatorSummaryBoard.hide();
            },
            onClick: (accountIdHex) => {
                const index = this.validatorMesh.getIndexOf(accountIdHex);
                if (index) {
                    const validator = this.validatorMesh.select(index);
                    if (validator) {
                        this.validatorDetailsBoard.show(
                            cloneJSONSafeObject(validator.getSummary())
                        );
                        this.validatorSummaryBoard.hide();
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
            const validator = this.validatorMesh.select(index);
            if (validator) {
                this.validatorDetailsBoard.show(cloneJSONSafeObject(validator.getSummary()));
                this.validatorSummaryBoard.hide();
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
        if (this.mouseIsInLeftPanel) {
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
            this.validatorSummaryBoard.hide();
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
    }

    private getBlockWithNumber(number: number): Block | undefined {
        return this.blocks.find((block) => {
            return block.getNumber() == number;
        });
    }

    private hasBlockWithHash(hashHex: string): boolean {
        return (
            this.blocks.filter((block) => {
                block.getHashHex() == hashHex;
            }).length > 0
        );
    }

    getChainTipHex(): string {
        return this.blocks[0].getHashHex();
    }

    private async fillMissingBlocks(header: Header, substrateClient: ApiPromise) {
        let parentHash = header.parentHash;
        const missingBlocks = new Array<SignedBlock>();
        while (parentHash.toHex() != this.getChainTipHex()) {
            const parent = await substrateClient.rpc.chain.getBlock(parentHash);
            missingBlocks.push(parent);
            parentHash = parent.block.header.parentHash;
        }
        for (const missingBlock of missingBlocks.reverse()) {
            const extendedHeader = await substrateClient.derive.chain.getHeader(
                missingBlock.block.header.toHex()
            );
            this.pushBlock(missingBlock.block, extendedHeader?.author?.toHex());
        }
    }

    async onNewBlock(header: Header, substrateClient: ApiPromise) {
        if (this.networkStatusBoard) {
            this.networkStatusBoard.setBestBlockNumber(header.number.toNumber());
        }
        await this.fillMissingBlocks(header, substrateClient);
        const extendedHeader = await substrateClient.derive.chain.getHeader(header.hash);
        const block = await substrateClient.rpc.chain.getBlock(header.hash);
        this.pushBlock(block.block, extendedHeader?.author?.toHex());
    }

    async pushBlock(substrateBlock: SubstrateBlock, authorAccountIdHex?: string) {
        if (this.hasBlockWithHash(substrateBlock.header.hash.toHex())) {
            // skip duplicate block
            return;
        }
        const block = new Block(substrateBlock);
        const blockNumber = substrateBlock.header.number.toNumber();
        const sibling = this.getBlockWithNumber(blockNumber);
        this.blocks.unshift(block);
        this.lock.acquire(
            this.blockPushLockKey,
            (done) => {
                const authorshipBegan = this.validatorMesh.beginAuthorship(
                    authorAccountIdHex,
                    (validator) => {
                        if (sibling) {
                            sibling.setSibling(block);
                            block.setSibling(sibling);
                            sibling.fork();
                        } else {
                            for (let i = 1; i < this.blocks.length; i++) {
                                const block = this.blocks[i];
                                block.setIndex(block.getIndex() + 1, true);
                            }
                        }
                        setTimeout(() => {
                            block.spawn(this.scene, validator.index, validator.ringSize, () => {
                                for (let i = this.blocks.length; i >= this.maxBlocks; i--) {
                                    const blockToRemove = this.blocks.pop();
                                    blockToRemove?.removeAndDispose();
                                }
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
                        block.addTo(this.scene);
                        done();
                    }, Constants.BLOCK_SHIFT_TIME_MS);
                }
            },
            (_err, _) => {
                // lock released
            }
        );
    }

    onFinalizedBlock(hash: string, number?: number) {
        if (number && this.networkStatusBoard) {
            this.networkStatusBoard.setFinalizedBlockNumber(number);
        }
        const block = this.blocks.find((block) => {
            return hash == block.getHashHex();
        });
        if (block) {
            block.finalize();
            this.onFinalizedBlock(block.getParentHashHex());
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
            this.validatorMesh.update(diff);
        }
    }

    removeValidators(accountsIds: Array<string>) {
        for (const accountIdHex of accountsIds) {
            this.validatorDetailsBoard.remove(accountIdHex);
            // summary board
            // mesh
        }
    }

    insertValidators(summaries: Array<ValidatorSummary>) {
        for (const summary of summaries) {
            console.log("insert validator: " + summary.accountId);
        }
        // mesh
    }
}

export { ChainVizScene };
