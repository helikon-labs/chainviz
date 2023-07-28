import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as Visibility from 'visibilityjs';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';

class Chainviz3DScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
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
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.outputColorSpace  = THREE.LinearSRGBColorSpace;
        document.getElementById('scene-container')?.appendChild(this.renderer.domElement);

        // stats
        this.stats = new Stats();
        //document.body.appendChild(this.stats.dom);
        //this.stats.domElement.style.cssText = "position:absolute; bottom:0px; right:0px;";
        // orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        this.limitOrbitControls();
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
        /*
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
        */
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

    start() {
        this.animate();
    }
}

export { Chainviz3DScene };
