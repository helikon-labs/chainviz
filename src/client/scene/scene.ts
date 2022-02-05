import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Block as SubstrateBlock, SignedBlock } from '@polkadot/types/interfaces';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Block } from '../model/app/block';
import { Validator } from '../model/app/validator';
import { ValidatorSummary } from '../model/subvt/validator_summary';
import AsyncLock = require('async-lock');
import { Constants } from '../util/constants';
import { NetworkStatus, NetworkStatusDiff } from '../model/subvt/network_status';
import { NetworkStatusBoard } from '../ui/network_status_board';

class ChainVizScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;

    private readonly raycaster: THREE.Raycaster;
    private clickPoint?: THREE.Vec2;
    private hoverPoint = new THREE.Vector2();
    private hoverValidator?: Validator;

    private readonly fontLoader = new FontLoader();
    private blockNumberFont!: Font;
    private readonly ringSizes = [82, 102, 120, 140, 165, 190, 201, 240];
    private readonly validatorMap = new Map<string, Validator>();
    private readonly blocks = new Array<Block>();
    private readonly maxBlocks = 13;
    private validatorsInited = false;

    private readonly lock = new AsyncLock();
    private readonly blockPushLockKey = "block_push";

    private readonly hoverInfoBoard = document.getElementById('hover-info-board')!;
    private networkStatusBoard!: NetworkStatusBoard;

    constructor() {
        // init font loader
        this.fontLoader.load( './font/fira_mono_regular.typeface.json', (font) => {
            this.blockNumberFont = font;
        });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = Constants.ORBIT_DEFAULT_DISTANCE;
        // axes helper :: x is red, y is green, z is blue
        const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        this.addLights();
        // raycaster
        this.raycaster = new THREE.Raycaster();
        this.clickPoint = undefined;
        document.addEventListener('click', (event) => {
            this.onClick(event);
        });
        document.addEventListener( 'mousemove', (event) => {
            this.onPointerMove(event);
        });
        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        // stats
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);
        this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.limitOrbitControls();
        window.addEventListener("resize", () => {
            this.onWindowResize();
        }, false);
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
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
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
        const minPan = new THREE.Vector3(
            -Constants.ORBIT_MAX_PAN_X,
            -Constants.ORBIT_MAX_PAN_Y,
            0
        );
        const maxPan = new THREE.Vector3(
            Constants.ORBIT_MAX_PAN_X,
            Constants.ORBIT_MAX_PAN_Y,
            0
        );
        const _v = new THREE.Vector3();
        this.controls.addEventListener("change", () => {
            _v.copy(this.controls.target);
            this.controls.target.clamp(minPan, maxPan);
            _v.sub(this.controls.target);
            this.camera.position.sub(_v);
        });
    }

    private onClick(event: MouseEvent) {
        this.clickPoint = new THREE.Vector2();
        this.clickPoint.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.clickPoint.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    private onPointerMove(event: MouseEvent) {
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

    private checkClickRaycast() {
        if (this.clickPoint != undefined) {
            this.raycaster.setFromCamera(this.clickPoint!, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, false);
            this.clickPoint = undefined;
        }
    }

    private setPointerCursor() {
        document.getElementsByTagName("html")[0].style.cursor = "pointer";
    }

    private setDefaultCursor() {
        document.getElementsByTagName("html")[0].style.cursor = "default";
    }

    private checkHoverRaycast() {
        this.raycaster.setFromCamera(this.hoverPoint, this.camera);
        const hoverIntersects = this.raycaster.intersectObjects(this.scene.children, false);
        if (hoverIntersects.length > 0) {
            const validator = this.validatorMap.get(hoverIntersects[0].object.uuid);
            this.hoverValidator?.clearHover();
            if (validator && !validator.isAuthoring()) {
                validator.onHover();
                this.hoverValidator = validator;
                this.setPointerCursor();
                const position = validator.getMeshOnScreenPosition(
                    this.renderer,
                    this.camera,
                );
                this.hoverInfoBoard.style.display = "block";
                this.hoverInfoBoard.classList.remove("block");
                this.hoverInfoBoard.classList.add("validator-hover-info-board");
                this.hoverInfoBoard.style.left = (position.x + Constants.HOVER_INFO_BOARD_X_OFFSET) + "px";
                this.hoverInfoBoard.style.top = (position.y + Constants.HOVER_INFO_BOARD_Y_OFFSET) + "px";
                this.hoverInfoBoard.innerHTML = validator.getHoverInfoHTML();
            } else {
                this.hoverValidator = undefined;
                this.setDefaultCursor();
                this.hoverInfoBoard.style.display = "none";
            }
        } else {
            this.hoverValidator?.clearHover();
            this.hoverValidator = undefined;
            this.setDefaultCursor();
            this.hoverInfoBoard.style.display = "none";
        }
    }

    private render() {
        if (this.validatorsInited) {
            this.checkClickRaycast();
            this.checkHoverRaycast();
        }
        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    start() {
        this.addChainRing();
        this.addChainLine();
        this.animate();
    }

    private addChainRing() {
        const geometry = new THREE.RingGeometry(
            18, 19,
            120, 1,
            Math.PI + Math.PI / 12, Math.PI * 11 / 6
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0x6D7379,
            side: THREE.DoubleSide
        });
        this.scene.add(
            new THREE.Mesh(
                geometry,
                material
            )
        );
    }

    private addChainLine() {
        const points = [];
        points.push( new THREE.Vector3(0, 0, 0));
        points.push( new THREE.Vector3(-(this.maxBlocks - 1) * 5, 0, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial( { color: 0x005500 } );
        this.scene.add(
            new THREE.Line(
                geometry,
                material
            )
        );
    }

    async initValidators(summaries: [ValidatorSummary]) {
        summaries.sort((a, b) => {
            if (a.isParaValidator && !b.isParaValidator) {
                return 1;
            } else if (!a.isParaValidator && b.isParaValidator) {
                return -1;
            } else {
                return 0;
            }
        });
        let index = 0;
        for (let ring = 0; ring < 10; ring++) {
            for (let i = 0; i < this.ringSizes[ring]; i++) {
                if (index >= summaries.length) {
                    break;
                }
                let validator = new Validator(
                    summaries[index],
                    [ring, i],
                    this.ringSizes[ring],
                );
                this.validatorMap.set(validator.getUUID(), validator);
                validator.addTo(this.scene);
                index++;
            }
            if (index >= summaries.length) {
                break;
            }
            await new Promise(resolve => { setTimeout(resolve, 150); });
        }
        setTimeout(() => {
            this.validatorsInited = true;
        }, 0);
    }

    async initBlocks(signedBlocks: Array<SignedBlock>) {
        for (let i = signedBlocks.length - 1; i >= 0; i--) {
            let block = new Block(signedBlocks[i].block, this.blockNumberFont);
            this.blocks.unshift(block);
            block.addTo(this.scene);
            block.setIndex(i, true);
            await new Promise(resolve => { setTimeout(resolve, 50); });
        }
    }

    private hasBlock(substrateBlock: SubstrateBlock): boolean {
        return this.blocks.filter((block) => {
            block.substrateBlock.header.hash.toHex() == substrateBlock.header.hash.toHex()
        }).length > 0
    }

    async pushBlock(
        substrateBlock: SubstrateBlock,
        authorAccountIdHex?: string,
    ) {
        if (this.hasBlock(substrateBlock)) {
            // skip duplicate block
            return;
        }
        this.lock.acquire(
            this.blockPushLockKey,
            (done) => {
                let block = new Block(substrateBlock, this.blockNumberFont);
                this.blocks.unshift(block);
                const validator = Array.from(this.validatorMap.values()).find((validator) => {
                    return validator.getAccountIdHex().toLowerCase() === authorAccountIdHex;
                });
                if (validator) {
                    validator.beginAuthorship(() => {
                        for (let i = 1; i < this.blocks.length; i++) {
                            const block = this.blocks[i];
                            block.setIndex(block.getIndex() + 1, true);
                        }
                        setTimeout(() => {
                            // shift blocks
                            block.spawn(
                                this.scene,
                                validator.index,
                                validator.ringSize,
                                () => {
                                    for (let i = this.blocks.length; i >= this.maxBlocks; i--) {
                                        let blockToRemove = this.blocks.pop();
                                        blockToRemove?.removeAndDispose()
                                    }
                                    done();
                                }
                            );
                            setTimeout(() => {
                                validator.endAuthorship();
                            }, Constants.VALIDATOR_AUTHORSHIP_END_DELAY);
                        }, Constants.BLOCK_SPAWN_DELAY);
                    });
                } else {
                    // shift blocks
                    for (const block of this.blocks) {
                        block.setIndex(block.getIndex() + 1, true);
                    }
                    setTimeout(() => {
                        block.addTo(this.scene);
                        done();
                    }, Constants.BLOCK_SHIFT_TIME_MS);
                }
            },
            (err, _) => {
                // lock released
            }
        );
    }

    onFinalizedBlock(hashHex: string) {
        this.blocks.find((block) => {
            return hashHex == block.substrateBlock.hash.toHex()
        })?.finalize();
    }

    initNetworkStatus(status: NetworkStatus) {
        this.networkStatusBoard = new NetworkStatusBoard(status);
    }

    updateNetworkStatus(diff: NetworkStatusDiff) {
        this.networkStatusBoard.update(diff);
    }


}

export { ChainVizScene };