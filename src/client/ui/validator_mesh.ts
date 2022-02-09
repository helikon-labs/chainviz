import * as THREE from "three";
import { Validator } from "../model/app/validator";
import { ValidatorSummary, ValidatorSummaryDiff } from "../model/subvt/validator_summary";
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
    private readonly validators = new Array<Validator | undefined>();
    private hoverValidatorIndex = -1;
    private authorValidatorIndex = -1;
    private selectedValidatorIndex = -1;

    constructor(validatorCount: number) {
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, validatorCount);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }

    private getRingIndexForIndex(index: number): [number, number] | undefined {
        let runningTotal = 0;
        for (let ringIndex = 0; ringIndex < this.ringSizes.length; ringIndex++) {
            if (index >= runningTotal && index < runningTotal + this.ringSizes[ringIndex]) {
                return [ringIndex, index - runningTotal];
            }
            runningTotal += this.ringSizes[ringIndex];
        }
        return undefined;
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
            if ((this.validators[i]?.getAccountIdHex() ?? "") == accountIdHex) {
                return i;
            }
        }
        return undefined;
    }

    isSelected(index: number): boolean {
        return this.selectedValidatorIndex == index;
    }

    hover(index: number): Validator | undefined {
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
            const validator = this.validators[this.hoverValidatorIndex];
            if (validator) {
                this.setColorAt(this.hoverValidatorIndex, validator.getColor());
            }
            this.hoverValidatorIndex = -1;
        }
    }

    getSelectedValidatorIndex(): number {
        return this.selectedValidatorIndex;
    }

    select(index: number): Validator | undefined {
        if (this.selectedValidatorIndex == index) {
            return undefined;
        }
        const validator = this.validators[index];
        if (validator) {
            this.clearSelection();
            validator.select();
            this.setMatrixAt(index, validator.getMatrix());
            this.setColorAt(index, new THREE.Color().setHex(Constants.VALIDATOR_SELECT_COLOR));
            this.selectedValidatorIndex = index;
            this.hoverValidatorIndex = -1;
            return validator;
        } else {
            return undefined;
        }
    }

    clearSelection() {
        if (this.selectedValidatorIndex < 0) {
            return;
        }
        const validator = this.validators[this.selectedValidatorIndex];
        if (validator) {
            validator.unselect();
            this.setMatrixAt(this.selectedValidatorIndex, validator.getMatrix());
            this.setColorAt(this.selectedValidatorIndex, validator.getColor());
            this.selectedValidatorIndex = -1;
        }
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
            return validator?.getAccountIdHex().toLowerCase() === accountIdHex;
        });
        if (index < 0) return false;
        const validator = this.validators[index];
        if (validator) {
            this.authorValidatorIndex = index;
            validator.beginAuthorship(this.mesh, index, () => {
                if (onComplete) onComplete(validator);
            });
            return true;
        } else {
            return false;
        }
    }

    endAuthorship(onComplete?: () => void) {
        if (this.authorValidatorIndex < 0) {
            if (onComplete) onComplete();
            return;
        }
        const index = this.authorValidatorIndex;
        this.authorValidatorIndex = -1;
        this.validators[index]?.endAuthorship(this.mesh, index, () => {
            if (onComplete) onComplete();
        });
    }

    update(diff: ValidatorSummaryDiff) {
        const index = this.getIndexOf(diff.accountId);
        if (index) {
            const validator = this.validators[index];
            if (validator) {
                validator.update(diff);
                if (this.selectedValidatorIndex != index && this.hoverValidatorIndex != index) {
                    this.setColorAt(index, validator.getColor());
                }
            }
        }
    }

    remove(accountIdHex: string) {
        const index = this.getIndexOf(accountIdHex);
        if (index) {
            if (this.selectedValidatorIndex == index) {
                this.selectedValidatorIndex = -1;
            }
            if (this.hoverValidatorIndex == index) {
                this.hoverValidatorIndex = -1;
            }
            const validator = this.validators[index];
            if (validator) {
                validator.remove();
                this.setMatrixAt(index, validator.getMatrix());
            }
            this.validators[index] = undefined;
        }
    }

    insert(summary: ValidatorSummary) {
        for (let i = 0; i < this.validators.length; i++) {
            const ringIndex = this.getRingIndexForIndex(i);
            if (this.validators[i] == undefined && ringIndex) {
                const [ring, i] = ringIndex;
                const validator = new Validator(summary, [ring, i], this.ringSizes[ring]);
                this.validators[i] = validator;
                this.setMatrixAt(i, validator.getMatrix());
                this.setColorAt(i, validator.getColor());
            }
        }
    }

    getValidatorCount(): number {
        return this.validators.filter((item) => item != undefined).length;
    }
}

export { ValidatorMesh };
