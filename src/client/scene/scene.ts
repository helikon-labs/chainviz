import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { SignedBlock } from '@polkadot/types/interfaces';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Block } from '../model/app/block';
import { Validator } from '../model/app/validator';
import { ValidatorSummary } from '../model/subvt/validator_summary';

class ChainVizScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;
    private readonly raycaster: THREE.Raycaster;
    private clickPoint?: THREE.Vec2;

    private readonly fontLoader = new FontLoader();
    private blockNumberFont!: Font;
    private readonly ringSizes = [82, 102, 120, 140, 165, 190, 201, 240];
    private readonly validators = new Array<Validator>();
    private readonly blocks = new Array<Block>();

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
        this.camera.position.z = 340;
        // axes helper :: x is red, y is green, z is blue
        const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
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
        this.controls.screenSpacePanning = true;
        // raycaster
        this.raycaster = new THREE.Raycaster();
        this.clickPoint = undefined;
        document.addEventListener('click', (event) => {
            this.onClick(event);
        });
        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);
    }

    private onClick(event: MouseEvent) {
        console.log('doc clicked');
        this.clickPoint = new THREE.Vector2();
        this.clickPoint.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.clickPoint.y = (event.clientY / window.innerHeight) * 2 + 1;
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

    private render() {
        if (this.clickPoint != undefined) {
            this.raycaster.setFromCamera(this.clickPoint!, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            console.log('INTERSECS :: ' + intersects.length);
            this.clickPoint = undefined;
        }

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    start() {
        this.addRelayChain();
        this.animate();
    }

    private addRelayChain() {
        const relayChainGeometry = new THREE.RingGeometry(
            18, 19,
            120, 1,
            Math.PI + Math.PI / 12, Math.PI * 11 / 6
        );
        const relayChainMaterial = new THREE.MeshBasicMaterial({
            color: 0x6D7379,
            side: THREE.DoubleSide
        });
        const relayChain = new THREE.Mesh(relayChainGeometry, relayChainMaterial);
        this.scene.add(relayChain);

        const lineMaterial = new THREE.LineBasicMaterial( { color: 0x005500 } );
        const points = [];
        points.push( new THREE.Vector3(0, 0, 0));
        points.push( new THREE.Vector3(-15000, 0, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        this.scene.add(line);
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
                this.validators.push(validator);
                validator.addTo(this.scene);
                index++;
            }
            if (index >= summaries.length) {
                break;
            }
            await new Promise(resolve => { setTimeout(resolve, 150); });
        }
    }

    async initBlocks(signedBlocks: Array<SignedBlock>) {
        for (let i = signedBlocks.length - 1; i >= 0; i--) {
            let block = new Block(signedBlocks[i], this.blockNumberFont);
            this.blocks.unshift(block);
            block.addTo(
                this.scene,
                0);
            block.setIndex(i, true);
            await new Promise(resolve => { setTimeout(resolve, 50); });
        }
    }
}

export { ChainVizScene };