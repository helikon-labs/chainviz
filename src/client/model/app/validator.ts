import * as THREE from 'three';
import { ValidatorSummary } from "../subvt/validator_summary";

class Validator {
    readonly mesh: THREE.Group;
    readonly summary: ValidatorSummary;

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

    constructor(summary: ValidatorSummary) {
        this.summary = summary;
        this.mesh = this.createMesh();
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
        const validator = new THREE.Group();
        validator.add(cylinder);
        //validator.add(topSphere);
        //validator.add(bottomSphere);
        validator.receiveShadow = true;


        return validator
    }
}

export { Validator }