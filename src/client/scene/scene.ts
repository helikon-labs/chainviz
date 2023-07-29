import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as Visibility from 'visibilityjs';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import { Para } from '../model/substrate/para';

class Chainviz3DScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;
    private readonly container: HTMLDivElement;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.scene = new THREE.Scene();
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

        // stats
        this.stats = new Stats();
        //document.body.appendChild(this.stats.dom);
        //this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        // orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        // this.limitOrbitControls();
        window.addEventListener(
            'resize',
            () => {
                this.onWindowResize();
            },
            false,
        );
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
            },
        ).start();
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
        this.controls.addEventListener('change', () => {
            _v.copy(this.controls.target);
            this.controls.target.clamp(minPan, maxPan);
            _v.sub(this.controls.target);
            this.camera.position.sub(_v);
        });
    }

    private onClick(_event: MouseEvent) {}

    private onMouseMove(_event: MouseEvent) {}

    private onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.render();
    }

    private animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        this.controls.update();
        this.render();
        this.stats.update();
    }

    private setPointerCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'pointer';
    }

    private setDefaultCursor() {
        document.getElementsByTagName('html')[0].style.cursor = 'default';
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private bezierCurve(p0: number, p1: number, p2: number, p3: number, t: number) {
        return (
            Math.pow(1 - t, 3) * p0 +
            3 * Math.pow(1 - t, 2) * t * p1 +
            3 * (1 - t) * Math.pow(t, 2) * p2 +
            Math.pow(t, 3) * p3
        );
    }

    start(paras: Para[]) {
        this.animate();
        this.initParachains(paras);
    }

    initParachains(paras: Para[]) {
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
        });
        material.opacity = 0.3;
        let points = [];
        points.push(new THREE.Vector3(-75, 0, 0));
        points.push(new THREE.Vector3(75, 0, 0));
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(lineGeometry, material);
        this.scene.add(line);

        points = [];
        points.push(new THREE.Vector3(0, 53, 0));
        points.push(new THREE.Vector3(0, -53, 0));
        lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        line = new THREE.Line(lineGeometry, material);
        this.scene.add(line);

        const radius = 48;
        const delta = (Math.PI / paras.length) * 2;
        let current = 0.0;
        const geometry = new THREE.CircleGeometry(1.35, 24, 24);
        for (const para of paras) {
            const texture = new THREE.TextureLoader().load(para.ui.logo);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.75,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(Math.sin(current) * radius, Math.cos(current) * radius, 0);
            this.scene.add(mesh);
            current += delta;
        }
    }
}

export { Chainviz3DScene };
