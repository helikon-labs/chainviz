import * as THREE from "three";
import { Validator } from "../model/app/validator";
import { ValidatorSummary } from "../model/subvt/validator_summary";
import { Constants } from "../util/constants";
import { getOnScreenPosition } from "../util/geometry";

class ValidatorMesh {
    private mesh: THREE.InstancedMesh;
    private readonly geometry = new THREE.CylinderGeometry(
        Constants.VALIDATOR_GEOM_RADIUS,
        Constants.VALIDATOR_GEOM_RADIUS,
        Constants.VALIDATOR_GEOM_HEIGHT,
        Constants.VALIDATOR_GEOM_SEGMENTS
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
    private selectedValidatorIndex = -1;

    constructor(validatorCount: number) {
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, validatorCount);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }

    async addTo(scene: THREE.Scene, summaries: Array<ValidatorSummary>) {
        scene.add(this.mesh);
        let index = 0;
        for (let ring = 0; ring < this.ringSizes.length; ring++) {
            for (let i = 0; i < this.ringSizes[ring]; i++) {
                if (index >= summaries.length) {
                    break;
                }
                const validator = new Validator(summaries[index], [ring, i], this.ringSizes[ring]);
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
            await new Promise((resolve) => {
                setTimeout(resolve, 150);
            });
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

    getIndexOf(accountIdHex: string): number | undefined {
        for (let i = 0; i < this.validators.length; i++) {
            if (this.validators[i].getAccountIdHex() == accountIdHex) {
                return i;
            }
        }
        return undefined;
    }

    isSelected(index: number): boolean {
        return this.selectedValidatorIndex == index;
    }

    hover(index: number): Validator {
        if (this.hoverValidatorIndex == index || this.selectedValidatorIndex == index) {
            return this.validators[index];
        }
        this.clearHover();
        this.hoverValidatorIndex = index;
        this.setColorAt(index, new THREE.Color().setHex(Constants.VALIDATOR_HOVER_COLOR));
        return this.validators[index];
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

    select(index: number): Validator | undefined {
        if (this.selectedValidatorIndex == index) {
            return undefined;
        }
        const validator = this.validators[index];
        validator.select();
        this.setMatrixAt(index, validator.getMatrix());
        this.setColorAt(index, new THREE.Color().setHex(Constants.VALIDATOR_SELECT_COLOR));
        this.selectedValidatorIndex = index;
        this.hoverValidatorIndex = -1;
        return validator;
    }

    clearSelection() {
        console.log("clear selection");
    }

    getOnScreenPositionOfItem(
        index: number,
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera
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
        validator.beginAuthorship(this.mesh, index, () => {
            if (onComplete) onComplete(this.validators[index]);
        });
        return true;
    }

    endAuthorship(onComplete?: () => void) {
        if (this.authorValidatorIndex < 0) {
            if (onComplete) onComplete();
            return;
        }
        const index = this.authorValidatorIndex;
        this.authorValidatorIndex = -1;
        this.validators[index].endAuthorship(this.mesh, index, () => {
            if (onComplete) onComplete();
        });
    }
}

export { ValidatorMesh };
