import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { rotateAboutPoint } from '../../util/geom_util';
import { ValidatorSummary } from "../subvt/validator_summary";
import { createTween } from '../../util/tween_util';
import { Constants } from '../../util/constants';

class Validator {
    private readonly mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhongMaterial>;
    private readonly summary: ValidatorSummary;
    readonly index: [number, number];
    readonly ringSize: number;
    private readonly color: THREE.Color;

    private readonly radius = 0.6;
    private readonly segments = 16;
    private readonly height = 2.8;

    constructor(
        summary: ValidatorSummary,
        index: [number, number],
        ringSize: number,
    ) {
        this.summary = summary;
        this.color = summary.isParaValidator
            ? Constants.PARA_VALIDATOR_COLOR
            : Constants.VALIDATOR_COLOR;
        this.index = index;
        this.ringSize = ringSize;
        this.mesh = this.createMesh();
    }

    private createMesh(): THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhongMaterial> {
        // cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments
        );
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 6,
            specular: Constants.VALIDATOR_SPECULAR_COLOR,
        });
        const cylinder = new THREE.Mesh(
            cylinderGeometry,
            material,
        );
        cylinder.receiveShadow = true;
        return cylinder;
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

    getAccountIdHex(): string {
        return this.summary.accountId;
    }

    beginAuthorship(onComplete: () => void) {
        const scaleTween = createTween(
            this.mesh.scale,
            {
                x: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                y: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                z: Constants.VALIDATOR_AUTHORSHIP_SCALE,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
        );
        const translateTween = createTween(
            this.mesh.position,
            { z: Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                onComplete();
            },
        );
        createTween(
            this.mesh.material.color,
            {
                r: 0.0,
                g: 1.0,
                b: 0.0,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                translateTween.start();
            }
        ).start();
    }

    endAuthorship(onComplete?: () => void) {
        const colorTween = createTween(
            this.mesh.material.color,
            this.color,
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                if (onComplete) {
                    onComplete();
                }
            }
        );
        const scaleTween = createTween(
            this.mesh.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
        );
        createTween(
            this.mesh.position,
            { z: 0 },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                colorTween.start();
            }
        ).start();
    }
}

export { Validator };