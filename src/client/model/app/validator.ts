import * as THREE from 'three';
import { rotateAboutPoint } from '../../util/geometry';
import { createTween } from '../../util/tween';
import { Constants } from '../../util/constants';
import { ValidatorSummary, ValidatorSummaryDiff } from '../subvt/validator_summary';

class Validator {
    private readonly object = new THREE.Object3D();
    private readonly summary: ValidatorSummary;
    readonly index: [number, number];
    readonly ringSize: number;
    private color!: THREE.Color;

    private _isAuthoring = false;
    private _isSelected = false;

    constructor(summary: ValidatorSummary, index: [number, number], ringSize: number) {
        this.summary = summary;
        this.index = index;
        this.ringSize = ringSize;
        this.updateMatrix();
        this.updateColor();
    }

    private updateColor() {
        this.color = this.summary.isParaValidator
            ? Constants.PARA_VALIDATOR_COLOR
            : Constants.VALIDATOR_COLOR;
    }

    private updateMatrix() {
        const [ring, i] = this.index;
        this.object.position.x = -22 - ring * 5;
        this.object.rotation.z = Math.PI / 2;
        rotateAboutPoint(
            this.object,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - i * ((11 * Math.PI) / 6 / this.ringSize),
            false
        );
        this.object.updateMatrix();
    }

    getMatrix(): THREE.Matrix4 {
        return this.object.matrix;
    }

    getColor(): THREE.Color {
        return this.color;
    }

    getAccountIdHex(): string {
        return this.summary.accountId;
    }

    getSummary(): ValidatorSummary {
        return this.summary;
    }

    beginAuthorship(validatorMesh: THREE.InstancedMesh, index: number, onComplete: () => void) {
        this._isAuthoring = true;
        if (this._isSelected) onComplete();
        const scaleTween = createTween(
            this.object.scale,
            {
                x: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                y: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                z: Constants.VALIDATOR_AUTHORSHIP_SCALE,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                this.object.updateMatrix();
                validatorMesh.setMatrixAt(index, this.getMatrix());
                if (validatorMesh.instanceMatrix) {
                    validatorMesh.instanceMatrix.needsUpdate = true;
                }
            }
        );
        const translateTween = createTween(
            this.object.position,
            { z: Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                this.object.updateMatrix();
                validatorMesh.setMatrixAt(index, this.getMatrix());
                if (validatorMesh.instanceMatrix) {
                    validatorMesh.instanceMatrix.needsUpdate = true;
                }
            },
            () => {
                onComplete();
            }
        );
        const color = this.color.clone();
        createTween(
            color,
            Constants.VALIDATOR_AUTHOR_COLOR_RGB,
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                validatorMesh.setColorAt(index, color);
                if (validatorMesh.instanceColor) {
                    validatorMesh.instanceColor.needsUpdate = true;
                }
            },
            () => {
                setTimeout(() => {
                    translateTween.start();
                }, 100);
            }
        ).start();
    }

    endAuthorship(validatorMesh: THREE.InstancedMesh, index: number, onComplete: () => void) {
        if (this._isSelected) {
            this._isAuthoring = false;
            onComplete();
        }
        const color = new THREE.Color().setHex(Constants.VALIDATOR_AUTHOR_COLOR);
        const colorTween = createTween(
            color,
            this.color,
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                validatorMesh.setColorAt(index, color);
                if (validatorMesh.instanceColor) {
                    validatorMesh.instanceColor.needsUpdate = true;
                }
            },
            () => {
                this._isAuthoring = false;
                if (onComplete) onComplete();
            }
        );
        const scaleTween = createTween(
            this.object.scale,
            { x: 1, y: 1, z: 1 },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                this.object.updateMatrix();
                validatorMesh.setMatrixAt(index, this.getMatrix());
                if (validatorMesh.instanceMatrix) {
                    validatorMesh.instanceMatrix.needsUpdate = true;
                }
            }
        );
        createTween(
            this.object.position,
            { z: 0 },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                this.object.updateMatrix();
                validatorMesh.setMatrixAt(index, this.getMatrix());
                if (validatorMesh.instanceMatrix) {
                    validatorMesh.instanceMatrix.needsUpdate = true;
                }
            },
            () => {
                colorTween.start();
            }
        ).start();
    }

    isAuthoring(): boolean {
        return this._isAuthoring;
    }

    select() {
        if (this._isSelected) {
            return;
        }
        this.object.scale.x = Constants.VALIDATOR_SELECT_SCALE;
        this.object.scale.y = Constants.VALIDATOR_SELECT_SCALE;
        this.object.scale.z = Constants.VALIDATOR_SELECT_SCALE;
        this.object.position.z = Constants.VALIDATOR_SELECT_TRANSLATE_Z;
        this.object.updateMatrix();
        this._isSelected = true;
    }

    unselect() {
        this.object.scale.x = 1;
        this.object.scale.y = 1;
        this.object.scale.z = 1;
        this.object.position.z = 0;
        this.object.updateMatrix();
        this._isSelected = false;
    }

    isSelected(): boolean {
        return this._isSelected;
    }

    update(diff: ValidatorSummaryDiff) {
        Object.assign(this.summary, diff);
        this.updateColor();
    }

    remove() {
        this.object.scale.x = 0;
        this.object.scale.y = 0;
        this.object.scale.z = 0;
        this.object.position.z = 0;
        this.object.updateMatrix();
    }
}

export { Validator };
