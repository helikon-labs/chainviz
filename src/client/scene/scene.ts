import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Constants } from '../util/constants';
import { Para } from '../model/substrate/para';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { ValidatorMesh } from './validator-mesh';
import { ParaMesh } from './para-mesh';
import { getOnScreenPosition } from '../util/geometry';
import { Block } from '../model/chainviz/block';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

const VALIDATOR_PARA_LINE_MATERIAL = new THREE.LineBasicMaterial({
    color: Constants.VALIDATOR_PARA_LINE_COLOR,
});
const BlOCK_LINE_MATERIAL = new THREE.LineBasicMaterial({
    color: Constants.BLOCK_LINE_COLOR,
});

interface SceneDelegate {
    onValidatorMouseEnter(index: number, validator: ValidatorSummary): void;
    onValidatorMouseLeave(): void;
    onParaMouseEnter(paraId: number): void;
    onParaMouseLeave(): void;
    onValidatorClick(index: number, validator: ValidatorSummary): void;
}

class Scene {
    private readonly scene: THREE.Scene;
    private readonly delegate: SceneDelegate;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;
    private readonly container: HTMLElement;
    private readonly paraMesh: ParaMesh;
    private readonly validatorMesh: ValidatorMesh;
    private validatorMeshIsRotating = false;
    private readonly mouseHoverPoint: THREE.Vector2 = new THREE.Vector2(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
    );
    private readonly raycaster: THREE.Raycaster;
    private started = false;
    private highlightedValidatorIndex: number | undefined = undefined;
    private validatorParaLines: THREE.Line[] = [];
    private highlightedParaId: number | undefined = undefined;

    constructor(container: HTMLDivElement, delegate: SceneDelegate) {
        this.container = container;
        this.delegate = delegate;
        this.paraMesh = new ParaMesh();
        this.validatorMesh = new ValidatorMesh();
        this.scene = new THREE.Scene();
        this.raycaster = new THREE.Raycaster();
        this.camera = new THREE.PerspectiveCamera(
            20,
            container.clientWidth / container.clientHeight,
            0.1,
            1000,
        );
        this.camera.position.set(
            Constants.CAMERA_START_POSITION.x,
            Constants.CAMERA_START_POSITION.y,
            Constants.CAMERA_START_POSITION.z,
        );
        this.camera.lookAt(new THREE.Vector3());

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000, 0);
        // this.renderer.outputColorSpace  = THREE.LinearSRGBColorSpace;
        container.appendChild(this.renderer.domElement);

        const geometry = new THREE.SphereGeometry(Constants.PARAS_CIRCLE_RADIUS);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.0,
        });
        material.colorWrite = false;
        const circle = new THREE.Mesh(geometry, material);
        circle.userData = {
            type: 'paraRegion',
        };
        circle.renderOrder = Number.MAX_SAFE_INTEGER;
        this.scene.add(circle);

        // stats
        this.stats = new Stats();
        //document.body.appendChild(this.stats.dom);
        //this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        // orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        window.addEventListener('click', (event) => {
            this.onClick(event);
        });
        window.addEventListener(
            'resize',
            () => {
                this.onWindowResize();
            },
            false,
        );
    }

    private onClick(_event: MouseEvent) {
        //const x = (event.clientX / window.innerWidth) * 2 - 1;
        //const y = -(event.clientY / window.innerHeight) * 2 + 1;
        if (this.highlightedValidatorIndex != undefined) {
            const slot = this.validatorMesh.getSlotAtIndex(this.highlightedValidatorIndex);
            if (slot) {
                this.delegate.onValidatorClick(this.highlightedValidatorIndex, slot.validator);
            }
        } else if (this.highlightedParaId != undefined) {
            console.log('para details', this.highlightedParaId);
        }
    }

    onMouseMove(event: MouseEvent) {
        const containerRect = this.container.getBoundingClientRect();
        const x = event.x - containerRect.left;
        const y = event.y - containerRect.top;
        this.mouseHoverPoint.x = (x / containerRect.width) * 2 - 1;
        this.mouseHoverPoint.y = -((y / containerRect.height) * 2 - 1);
    }

    private onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.render();
    }

    animate() {
        this.controls.update();
        this.stats.update();
        this.render();
        if (this.validatorMeshIsRotating && this.highlightedParaId == undefined) {
            this.validatorMesh.rotate();
        }
    }

    private render() {
        if (this.started) {
            this.checkMouseHoverRaycast();
        }
        this.renderer.render(this.scene, this.camera);
    }

    private checkMouseHoverRaycast() {
        this.raycaster.setFromCamera(this.mouseHoverPoint, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        let validatorIndex: number | undefined = undefined;
        let paraId: number | undefined = undefined;
        let intersectsParaRegion = false;
        for (const intersect of intersects) {
            const userData = intersect.object.userData;
            const type = userData['type'];
            if (type == 'validator' && intersect.instanceId != undefined) {
                validatorIndex = intersect.instanceId;
            } else if (type == 'para' && userData['paraId'] != undefined) {
                paraId = userData['paraId'];
            } else if (type == 'paraRegion') {
                intersectsParaRegion = true;
            }
        }
        this.validatorMeshIsRotating = !intersectsParaRegion;
        if (validatorIndex) {
            this.setPointerCursor();
            if (validatorIndex != this.highlightedValidatorIndex) {
                const slot = this.validatorMesh.getSlotAtIndex(validatorIndex);
                if (slot) {
                    this.delegate.onValidatorMouseEnter(validatorIndex, slot.validator);
                }
                this.highlightedValidatorIndex = validatorIndex;
            }
        } else {
            if (this.highlightedValidatorIndex) {
                this.delegate.onValidatorMouseLeave();
                this.highlightedValidatorIndex = undefined;
                this.setDefaultCursor();
            }
            if (paraId != undefined) {
                if (paraId != this.highlightedParaId) {
                    this.highlightedParaId = paraId;
                    this.setPointerCursor();
                    this.delegate.onParaMouseEnter(paraId);
                }
            } else {
                if (this.highlightedParaId != undefined) {
                    this.highlightedParaId = undefined;
                    this.delegate.onParaMouseLeave();
                    this.setDefaultCursor();
                }
            }
        }
    }

    private setPointerCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'pointer';
    }

    private setDefaultCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'default';
    }

    start(paras: Para[], validatorMap: Map<string, ValidatorSummary>, onComplete?: () => void) {
        this.paraMesh.start(this.scene, paras);
        this.validatorMesh.start(this.scene, validatorMap, () => {
            this.started = true;
            if (onComplete) {
                onComplete();
            }
        });
        this.validatorMeshIsRotating = true;
    }

    reset(onComplete?: () => void) {
        this.validatorMeshIsRotating = false;
        this.paraMesh.reset();
        this.validatorMesh.reset(onComplete);
    }

    getValidatorOnScreenPosition(stashAddress: string): THREE.Vec2 | undefined {
        const position = this.validatorMesh.getValidatorPosition(stashAddress);
        if (position == undefined) {
            return undefined;
        }
        return getOnScreenPosition(position, this.renderer, this.camera);
    }

    private addParaValidatorLines(paraId: number, paraValidatorStashAddresses: string[]) {
        const paraPosition = this.paraMesh.getParaPosition(paraId);
        if (paraPosition) {
            for (const paraValidatorStashAddress of paraValidatorStashAddresses) {
                const validatorPosition =
                    this.validatorMesh.getValidatorPosition(paraValidatorStashAddress);
                if (validatorPosition == undefined) {
                    continue;
                }
                const points = [];
                points.push(validatorPosition);
                points.push(paraPosition);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const validatorParaLine = new THREE.Line(geometry, VALIDATOR_PARA_LINE_MATERIAL);
                this.validatorParaLines.push(validatorParaLine);
                this.scene.add(validatorParaLine);
            }
        }
    }

    private removeParaValidatorLines() {
        for (const validatorParaLine of this.validatorParaLines) {
            this.scene.remove(validatorParaLine);
        }
        this.validatorParaLines = [];
    }

    highlightValidator(index: number, validator: ValidatorSummary) {
        this.validatorMesh.highlightValidator(index);
        if (validator.paraId) {
            this.addParaValidatorLines(validator.paraId, [validator.address]);
        }
    }

    clearValidatorHighlight() {
        this.validatorMesh.clearHighlight();
        this.paraMesh.clearHighlight();
        this.removeParaValidatorLines();
    }

    highlightParas(paraIds: number[]) {
        this.paraMesh.highlightParas(paraIds);
    }

    highlightPara(paraId: number, paraValidatorStashAddresses: string[]) {
        this.paraMesh.highlightParas([paraId]);
        this.validatorMesh.highlightParaValidators(paraId);
        this.addParaValidatorLines(paraId, paraValidatorStashAddresses);
    }

    clearParaHighlight() {
        this.paraMesh.clearHighlight();
        this.validatorMesh.clearHighlight();
        this.removeParaValidatorLines();
    }

    getParaOnScreenPosition(paraId: number): THREE.Vec2 {
        return getOnScreenPosition(
            this.paraMesh.getParaPosition(paraId)!,
            this.renderer,
            this.camera,
        );
    }

    private getVisibleHeight(): number {
        // compensate for cameras not positioned at z = 0
        const cameraOffset = this.camera.position.z;
        // vertical fov in radians
        const vFOV = (this.camera.fov * Math.PI) / 180;
        // Math.abs to ensure the result is always positive
        return 2 * Math.tan(vFOV / 2) * Math.abs(cameraOffset);
    }

    private getVisibleWidth(): number {
        const height = this.getVisibleHeight();
        return height * this.camera.aspect;
    }

    getCandidateBlockBeamTargetPosition(hash: string): THREE.Vector3 | undefined {
        const candidateBlock = document.getElementById(`candidate-block-${hash}`);
        if (!candidateBlock) {
            return undefined;
        }
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) {
            return undefined;
        }
        const candidateBlockBoundingRect = candidateBlock.getBoundingClientRect();
        const sceneContainerBoundingRect = sceneContainer.getBoundingClientRect();

        const height = this.getVisibleHeight();
        const delta =
            candidateBlockBoundingRect.bottom -
            (candidateBlockBoundingRect.height - 2) / 2 -
            sceneContainerBoundingRect.top;
        const ratio = delta / sceneContainerBoundingRect.height;
        const targetY = height / 2 - height * ratio;
        const width = this.getVisibleWidth();
        return new THREE.Vector3(width / 2 - 1, targetY, 0);
    }

    onNewBlock(block: Block, onHalfTime: () => void, onComplete: () => void) {
        if (this.highlightedValidatorIndex != undefined || this.highlightedParaId != undefined) {
            onComplete();
            return;
        }
        const authorStashAddress = block.authorAccountId?.toString();
        if (authorStashAddress == undefined) {
            return;
        }
        // beam
        const positionCount = 100;
        const beamGeometry = new THREE.BufferGeometry();
        const beamPositions = new Float32Array(positionCount * 3);
        beamGeometry.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
        const beam = new THREE.Line(beamGeometry, BlOCK_LINE_MATERIAL);
        this.scene.add(beam);
        // block line
        const blockLineGeometry = new THREE.BufferGeometry();
        const blockLinePositions = new Float32Array(2 * 3);
        blockLineGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(blockLinePositions, 3),
        );
        const blockLine = new THREE.Line(blockLineGeometry, BlOCK_LINE_MATERIAL);
        this.scene.add(blockLine);

        const hash = block.block.header.hash.toHex();
        const progress = { progress: 0 };
        let crossedHalfTime = false;
        createTween(
            progress,
            { progress: positionCount * 2 },
            TWEEN.Easing.Quadratic.InOut,
            Constants.NEW_BLOCK_BEAM_ANIM_DURATION_MS,
            undefined,
            () => {
                const flProgress = Math.floor(progress.progress);
                const beamTargetPosition = this.getCandidateBlockBeamTargetPosition(hash);
                if (beamTargetPosition == undefined) {
                    return;
                }
                const beamPositionAttribute = beam.geometry.getAttribute('position');
                const validatorPosition = this.validatorMesh.getValidatorPosition(
                    authorStashAddress ?? '',
                );
                if (validatorPosition == undefined) {
                    return;
                }
                for (let i = 0; i < positionCount; i++) {
                    const position = validatorPosition
                        .clone()
                        .lerp(beamTargetPosition, i / (positionCount - 1.0));
                    beamPositionAttribute.setXYZ(i, position.x, position.y, position.z);
                }
                beamPositionAttribute.needsUpdate = true;
                if (progress.progress <= positionCount) {
                    beam.geometry.setDrawRange(0, flProgress);
                } else {
                    if (!crossedHalfTime) {
                        crossedHalfTime = true;
                        onHalfTime();
                    }
                    const index = flProgress - positionCount;
                    beam.geometry.setDrawRange(index, positionCount - index);
                    const blockLinePositionAttribute = blockLine.geometry.getAttribute('position');
                    blockLinePositionAttribute.setXYZ(
                        0,
                        beamTargetPosition.x,
                        beamTargetPosition.y - 1.2,
                        beamTargetPosition.z,
                    );
                    blockLinePositionAttribute.setXYZ(
                        1,
                        beamTargetPosition.x,
                        beamTargetPosition.y + 1.2,
                        beamTargetPosition.z,
                    );
                    blockLinePositionAttribute.needsUpdate = true;
                }
            },
            () => {
                this.scene.remove(beam);
                this.scene.remove(blockLine);
                onComplete();
            },
        ).start();
    }

    selectValidator(index: number) {
        this.validatorMesh.selectValidator(index);
    }

    clearValidatorSelection() {
        this.validatorMesh.clearSelection();
    }

    updateValidators(updatedValidators: ValidatorSummary[]) {
        this.validatorMesh.updateValidators(updatedValidators);
    }
}

export { Scene, SceneDelegate };
