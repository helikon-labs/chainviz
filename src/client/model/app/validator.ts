import * as THREE from 'three';
import { rotateAboutPoint } from '../../utils/geom_util';
import { ValidatorSummary } from "../subvt/validator_summary";

class Validator {
    private readonly mesh: THREE.Group;
    private readonly summary: ValidatorSummary;
    private readonly index: [number, number];
    private readonly ringSize: number;

    private readonly normalMaterial = new THREE.MeshNormalMaterial();
    private readonly phongMaterial = new THREE.MeshPhongMaterial({
        color: 0xE6007A,
        shininess: 6,
        specular: 0xffffff,
    });
    private readonly phongMaterial2 = new THREE.MeshPhongMaterial({
        color: 0x8EDFFF,
        shininess: 6,
        specular: 0xffffff,
    });

    private readonly radius = 0.6;
    private readonly segments = 16;
    private readonly height = 2.8;

    constructor(
        summary: ValidatorSummary,
        index: [number, number],
        ringSize: number,
    ) {
        this.summary = summary;
        this.mesh = this.createMesh();
        this.index = index;
        this.ringSize = ringSize;
    }

    private createMesh(): THREE.Group {
        // cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments
        );
        let material = this.summary.isParaValidator ? this.phongMaterial2 : this.phongMaterial;
        const cylinder = new THREE.Mesh(
            cylinderGeometry,
            material,
        );
        const sphereGeometry = new THREE.SphereGeometry(
            this.radius,
            this.segments,
            this.segments
        );
        // top
        const topSphere = new THREE.Mesh(sphereGeometry, material)
        topSphere.position.y = this.height / 2;
        // bottom
        const bottomSphere = new THREE.Mesh(sphereGeometry, material)
        bottomSphere.position.y = -this.height / 2;
        // group
        const group = new THREE.Group();
        group.add(cylinder);
        //group.add(topSphere);
        //group.add(bottomSphere);
        group.receiveShadow = true;
        return group
    }

    addTo(scene: THREE.Scene) {
        const [ring, i] = this.index;
        this.mesh.position.x = -22 - (ring * 5);
        this.mesh.rotation.z = Math.PI / 2;
        rotateAboutPoint(
            this.mesh,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - i * ((11 * Math.PI / 6) / this.ringSize),
            false,
        );
        scene.add(this.mesh);
    }
}

export { Validator };