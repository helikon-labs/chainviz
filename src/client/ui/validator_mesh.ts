import * as THREE from 'three';
import { Validator } from '../model/app/validator';
import { ValidatorSummary } from '../model/subvt/validator_summary';
import { Constants } from "../util/constants";
import { getOnScreenPosition } from '../util/geom_util';

class ValidatorMesh {
    private mesh: THREE.InstancedMesh;
    private readonly geometry = new THREE.CylinderGeometry(
        Constants.VALIDATOR_GEOM_RADIUS,
        Constants.VALIDATOR_GEOM_RADIUS,
        Constants.VALIDATOR_GEOM_HEIGHT,
        Constants.VALIDATOR_GEOM_SEGMENTS,
    );
    private readonly material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(),
        shininess: Constants.VALIDATOR_SHININESS,
        specular: Constants.VALIDATOR_SPECULAR_COLOR,
    });

    private readonly ringSizes = [82, 102, 120, 140, 165, 190, 201, 240];
    private readonly validators = new Array<Validator>();
    private hoverValidatorIndex = -1;
    private authorValidatorIndex = -1;

    constructor(summaries: [ValidatorSummary]) {
        this.mesh = new THREE.InstancedMesh(
            this.geometry,
            this.material,
            summaries.length
        );
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.initValidators(summaries);
    }

    private async initValidators(summaries: [ValidatorSummary]) {
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
                this.mesh.setMatrixAt(index, validator.getMatrix());
                this.mesh.setColorAt(index, validator.getColor());
                index++;
            }
            this.refreshMeshColor();
            this.refreshMeshMatrix();
            if (index >= summaries.length) {
                break;
            }
            await new Promise(resolve => { setTimeout(resolve, 150); });
        }
    }

    private refreshMeshColor() {
        if (this.mesh.instanceColor) {
            this.mesh.instanceColor.needsUpdate = true;
        }
    }

    private refreshMeshMatrix() {
        if (this.mesh.instanceMatrix) {
            this.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    addTo(scene: THREE.Scene) {
        scene.add(this.mesh);
    }

    hover(index?: number): Validator | undefined {
        if (index) {
            if (this.hoverValidatorIndex == index) {
                return this.validators[index];
            }
            this.clearHover();
            this.hoverValidatorIndex = index;
            this.setColorAt(index, new THREE.Color().setHex(0xFFFF00));
            return this.validators[index];
        } else {
            return undefined;
        }
    }

    clearHover() {
        if (this.hoverValidatorIndex >= 0) {
            this.setColorAt(
                this.hoverValidatorIndex,
                this.validators[this.hoverValidatorIndex].getColor()
            );
            this.hoverValidatorIndex = -1;
        }
    }

    getOnScreenPositionOfItem(
        index: number,
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera,
    ): THREE.Vec2 {
        const matrix = new THREE.Matrix4();
        this.mesh.getMatrixAt(index, matrix);
        const position = new THREE.Vector3();
        matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
        return getOnScreenPosition(position, renderer, camera);
    }

    private setColorAt(index: number, color: THREE.Color) {
        this.mesh.setColorAt(index, color);
        this.refreshMeshColor();
    }

    private setMatrixAt(index: number, matrix: THREE.Matrix4) {
        this.mesh.setMatrixAt(index, matrix);
        this.refreshMeshMatrix();
    }

    beginAuthorship(accountIdHex?: string, onComplete?: (validator: Validator) => void): boolean {
        const index = this.validators.findIndex((validator) => {
            return validator.getAccountIdHex().toLowerCase() === accountIdHex;
        });
        if (index < 0) return false;
        this.authorValidatorIndex = index;
        const validator = this.validators[index];
        validator.beginAuthorship(
            (color) => { this.setColorAt(index, color); },
            (matrix) => { this.setMatrixAt(index, matrix); },
            () => {
                if (onComplete) onComplete(this.validators[index]);
            }
        )
        return true;
    }

    endAuthorship(onComplete?: () => void) {
        if (this.authorValidatorIndex < 0) {
            if (onComplete) onComplete();
            return;
        }
        const index = this.authorValidatorIndex;
        this.authorValidatorIndex = -1;
        this.validators[index].endAuthorship(
            (color) => { this.setColorAt(index, color); },
            (matrix) => { this.setMatrixAt(index, matrix); },
            () => { if (onComplete) onComplete(); }
        )
    }
}

export { ValidatorMesh };