import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Constants } from '../util/constants';
import { Para } from '../model/substrate/para';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { ValidatorMesh } from './validator-mesh';
import { ParaMesh } from './para-mesh';
import { getOnScreenPosition } from '../util/geometry';

const VALIDATOR_PARA_LINE_MATERIAL = new THREE.LineBasicMaterial({
    color: Constants.VALIDATOR_PARA_LINE_COLOR,
});

interface SceneDelegate {
    onValidatorHover(index: number, validator: ValidatorSummary): void;
    clearValidatorHover(): void;
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
    private readonly mouseHoverPoint: THREE.Vector2 = new THREE.Vector2();
    private readonly raycaster: THREE.Raycaster;
    private started = false;
    private highlightedValidatorIndex: number | undefined = undefined;
    private validatorParaLine: THREE.Line | undefined = undefined;

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
        container.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        window.addEventListener(
            'resize',
            () => {
                this.onWindowResize();
            },
            false,
        );
    }

    private onClick(event: MouseEvent) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        console.log('click', x, y);
    }

    private onMouseMove(event: MouseEvent) {
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
        if (this.validatorMeshIsRotating) {
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
        this.setDefaultCursor();
        let validatorIndex: number | undefined = undefined;
        let intersectsPara = false;
        let intersectsParaRegion = false;
        for (const intersect of intersects) {
            const type = intersect.object.userData['type'];
            if (type == 'validator' && intersect.instanceId != undefined) {
                validatorIndex = intersect.instanceId;
            } else if (type == 'para') {
                intersectsPara = true;
            } else if (type == 'paraRegion') {
                intersectsParaRegion = true;
            }
        }
        this.validatorMeshIsRotating = !intersectsParaRegion && this.started;
        if (validatorIndex) {
            this.setPointerCursor();
            if (validatorIndex != this.highlightedValidatorIndex) {
                const slot = this.validatorMesh.getSlotAtIndex(validatorIndex);
                if (slot) {
                    this.delegate.onValidatorHover(validatorIndex, slot.validator);
                }
                this.highlightedValidatorIndex = validatorIndex;
            }
        } else {
            if (this.highlightedValidatorIndex) {
                this.delegate.clearValidatorHover();
                this.highlightedValidatorIndex = undefined;
            }
            if (intersectsPara) {
                this.setPointerCursor();
            } else {
                this.setDefaultCursor();
            }
        }
    }

    private setPointerCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'pointer';
    }

    private setDefaultCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'default';
    }

    private bezierCurve(p0: number, p1: number, p2: number, p3: number, t: number) {
        return (
            Math.pow(1 - t, 3) * p0 +
            3 * Math.pow(1 - t, 2) * t * p1 +
            3 * (1 - t) * Math.pow(t, 2) * p2 +
            Math.pow(t, 3) * p3
        );
    }

    start(paras: Para[], validatorMap: Map<string, ValidatorSummary>) {
        const relayChainValidatorMap = new Map<string, ValidatorSummary>();
        for (const key of validatorMap.keys()) {
            const validator = validatorMap.get(key)!;
            if (!validator.isParaValidator) {
                relayChainValidatorMap.set(key, validator);
            }
        }
        this.paraMesh.start(this.scene, paras);
        this.validatorMesh.start(this.scene, validatorMap, () => {
            this.started = true;
        });
        this.validatorMeshIsRotating = true;
    }

    reset(onComplete?: () => void) {
        this.validatorMeshIsRotating = false;
        //this.paraMesh.reset();
        this.validatorMesh.reset(onComplete);
    }

    getValidatorOnScreenPosition(index: number): THREE.Vec2 {
        return getOnScreenPosition(
            this.validatorMesh.getValidatorPosition(index),
            this.renderer,
            this.camera,
        );
    }

    highlightValidator(index: number, validator: ValidatorSummary) {
        const paraPosition = this.paraMesh.getParaPosition(validator.paraId ?? -1);
        if (paraPosition) {
            const validatorPosition = this.validatorMesh.getValidatorPosition(index);
            const points = [];
            points.push(validatorPosition);
            points.push(paraPosition);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.validatorParaLine = new THREE.Line(geometry, VALIDATOR_PARA_LINE_MATERIAL);
            this.scene.add(this.validatorParaLine);
            this.paraMesh.highlightPara(validator.paraId ?? -1);
        }
        this.validatorMesh.highlightValidator(index);
    }

    clearHighlight() {
        this.validatorMesh.clearHighlight();
        if (this.validatorParaLine) {
            this.scene.remove(this.validatorParaLine);
        }
        this.validatorParaLine = undefined;
        this.paraMesh.clearHighlight();
    }
}

export { Scene, SceneDelegate };
