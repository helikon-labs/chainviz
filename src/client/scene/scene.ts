import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Validator } from '../model/app/validator';
import { ValidatorSummary } from '../model/subvt/validator_summary';

class ChainVizScene {
    private readonly scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly stats: Stats;
    private readonly validators = new Array<Validator>();
    private readonly raycaster: THREE.Raycaster;
    private clickPoint?: THREE.Vec2;

    constructor() {
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
        this.scene.add(axesHelper);
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
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
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

        // relay chain
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

    }

    private onClick(event: MouseEvent) {
        console.log('doc clicked');
        this.clickPoint = new THREE.Vector2();
        this.clickPoint.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.clickPoint.y = (event.clientY / window.innerHeight) * 2 + 1;
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.render()
    }

    private animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        this.controls.update()
        this.render()
    
        this.stats.update()
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
        this.animate();
    }

    addValidators(summaries: [ValidatorSummary]) {
        let ringSizes = [82, 102, 120, 140, 165, 191, 200, 240];
        let index = 0;
        for (let ring = 0; ring < 10; ring++) {
            for (let i = 0; i < ringSizes[ring]; i++) {
                if (index >= summaries.length) {
                    break;
                }
                let validator = new Validator(summaries[index]);
                this.validators.push(validator);
                validator.mesh.position.x = -22 - (ring * 5);
                validator.mesh.rotation.z = Math.PI / 2;
                validator.mesh.addEventListener(
                    "click",
                    function() {
                        alert(summaries[index].accountId);
                    }
                )
                this.scene.add(validator.mesh);
                this.rotateAboutPoint(
                    validator.mesh,
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 1),
                    -(Math.PI / 10.5) - i * ((11 * Math.PI / 6) / ringSizes[ring]),
                    false,
                );
                index++;
            }
        }
    }

    private rotateAboutPoint(
        obj: THREE.Object3D,
        point: THREE.Vector3,
        axis: THREE.Vector3,
        theta: number,
        pointIsWorld: boolean,
    ){
        pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;
    
        if(pointIsWorld){
            obj.parent?.localToWorld(obj.position); // compensate for world coordinate
        }
    
        obj.position.sub(point); // remove the offset
        obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
        obj.position.add(point); // re-add the offset
    
        if(pointIsWorld){
            obj.parent?.worldToLocal(obj.position); // undo world coordinates compensation
        }
    
        obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    }
}

export { ChainVizScene }