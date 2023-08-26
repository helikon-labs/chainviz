import * as THREE from 'three';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';
import { rotateAboutPoint } from '../util/geometry';
import { cloneJSONSafeObject } from '../util/object';

const ARC_GEOMETRY = new THREE.TorusGeometry(Constants.VALIDATOR_ARC_RADIUS, 0.06, 12, 36, Math.PI);
ARC_GEOMETRY.rotateZ(Math.PI / 2);

const ARC_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_ARC_COLOR,
    transparent: true,
    opacity: Constants.VALIDATOR_ARC_NORMAL_OPACITY,
});
const VALIDATOR_GEOMETRY = new THREE.SphereGeometry(
    Constants.VALIDATOR_SPHERE_MAX_RADIUS,
    Constants.VALIDATOR_SPHERE_WIDTH_SEGMENTS,
    Constants.VALIDATOR_SPHERE_HEIGHT_SEGMENTS,
);
const VALIDATOR_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_SPHERE_COLOR,
    transparent: true,
    opacity: Constants.SCENE_VALIDATOR_OPACITY,
});
const VALIDATOR_SELECTOR_GEOMETRY = new THREE.SphereGeometry(
    Constants.VALIDATOR_SELECTOR_SPHERE_RADIUS,
    Constants.VALIDATOR_SPHERE_WIDTH_SEGMENTS,
    Constants.VALIDATOR_SPHERE_HEIGHT_SEGMENTS,
);
const VALIDATOR_SELECTOR_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_SELECTOR_SPHERE_COLOR,
    transparent: true,
    opacity: Constants.VALIDATOR_SELECTOR_SPHERE_OPACITY,
});

interface ValidatorSlot {
    validator: ValidatorSummary;
    stashAddress: string;
    scale: number;
}

class ValidatorMesh {
    private arcMesh!: THREE.InstancedMesh;
    private validatorMesh!: THREE.InstancedMesh;
    private validatorSelectorMesh!: THREE.Mesh;
    private group!: THREE.Group;
    private arcs: (ValidatorSlot | undefined)[][] = [];
    private highlightedValidatorIndex: number | undefined = undefined;
    private highlightedParaId: number | undefined = undefined;

    private getMinMaxRewardPoints(): [number, number] {
        let minRewardPoints = Number.MAX_SAFE_INTEGER;
        let maxRewardPoints = 0;
        for (let i = 0; i < this.arcs.length; i++) {
            for (let j = 0; j < this.arcs[i].length; j++) {
                if (this.arcs[i][j]) {
                    const validator = this.arcs[i][j]!.validator;
                    minRewardPoints = Math.min(minRewardPoints, validator.rewardPoints ?? 0);
                    maxRewardPoints = Math.max(maxRewardPoints, validator.rewardPoints ?? 0);
                }
            }
        }
        return [minRewardPoints, maxRewardPoints];
    }

    private initSlots(validatorMap: Map<string, ValidatorSummary>) {
        // init arcs
        this.arcs = [];
        let arcCount = Constants.MIN_ARC_COUNT;
        let validatorsPerArc = Math.ceil(validatorMap.size / arcCount);
        while (validatorsPerArc > Constants.MAX_VALIDATORS_PER_ARC) {
            arcCount++;
            validatorsPerArc = Math.ceil(validatorMap.size / arcCount);
        }
        for (let i = 0; i < arcCount; i++) {
            this.arcs.push([]);
            for (let j = 0; j < validatorsPerArc; j++) {
                this.arcs[i].push(undefined);
            }
        }
        // fill slots
        const validatorMapKeys = Array.from(validatorMap.keys());
        for (let i = 0; i < validatorMapKeys.length; i++) {
            const validator = validatorMap.get(validatorMapKeys[i])!;
            const arcIndex = Math.floor(i / validatorsPerArc);
            const indexInArc = i % validatorsPerArc;
            this.arcs[arcIndex][indexInArc] = {
                validator: cloneJSONSafeObject(validator),
                stashAddress: validator.address,
                scale: 0,
            };
        }
    }

    private initScales() {
        const minScale =
            Constants.VALIDATOR_SPHERE_MIN_RADIUS / Constants.VALIDATOR_SPHERE_MAX_RADIUS;
        const [minRewardPoints, maxRewardPoints] = this.getMinMaxRewardPoints();
        let scaleStep = 0;
        if (maxRewardPoints != 0) {
            scaleStep = (1.0 - minScale) / (maxRewardPoints - minRewardPoints);
        }
        for (let i = 0; i < this.arcs.length; i++) {
            for (let j = 0; j < this.arcs[i].length; j++) {
                if (this.arcs[i][j]) {
                    const scale =
                        minScale +
                        scaleStep * (this.arcs[i][j]!.validator.rewardPoints - minRewardPoints);
                    this.arcs[i][j]!.scale = scale;
                }
            }
        }
    }

    start(
        scene: THREE.Scene,
        validatorMap: Map<string, ValidatorSummary>,
        onComplete?: () => void,
    ) {
        if (this.group) {
            scene.remove(this.group);
        }
        this.group = new THREE.Group();
        // init arcs
        this.initSlots(validatorMap);
        this.initScales();
        // create arc mesh
        this.arcMesh = new THREE.InstancedMesh(ARC_GEOMETRY, ARC_MATERIAL, this.arcs.length);
        this.arcMesh.userData = {
            type: 'arc',
        };
        this.group.add(this.arcMesh);
        // create validator mesh
        this.validatorMesh = new THREE.InstancedMesh(
            VALIDATOR_GEOMETRY,
            VALIDATOR_MATERIAL,
            this.arcs.length * this.arcs[0].length,
        );
        this.validatorMesh.userData = {
            type: 'validator',
        };
        this.group.add(this.validatorMesh);
        // add to scene
        scene.add(this.group);
        // init selector
        this.validatorSelectorMesh = new THREE.InstancedMesh(
            VALIDATOR_SELECTOR_GEOMETRY,
            VALIDATOR_SELECTOR_MATERIAL,
            this.arcs.length * this.arcs[0].length,
        );
        // initial animation
        this.animate(false, onComplete);
    }

    private animate(isReverse: boolean, onComplete?: () => void) {
        const progress = { progress: isReverse ? 1.0 : 0.0 };
        const currentRotationY = this.group.rotation.y;
        createTween(
            progress,
            { progress: isReverse ? 0.0 : 1.0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.SCENE_STATE_TRANSITION_ANIM_DURATION_MS,
            undefined,
            () => {
                for (let i = 0; i < this.arcs.length; i++) {
                    let rotationY = i * ((2 * Math.PI) / this.arcs.length) * progress.progress;
                    if (i >= this.arcs.length / 2) {
                        const target =
                            ((i - this.arcs.length / 2) * Math.PI) / (this.arcs.length / 2.0);
                        rotationY = Math.PI + target * progress.progress;
                    }
                    const object = new THREE.Object3D();
                    object.rotation.y = rotationY;
                    object.updateMatrix();
                    this.arcMesh.setMatrixAt(i, object.matrix);
                    // update validators
                    const angleDelta = Math.PI / (this.arcs[0].length + 1);
                    let currentAngle = angleDelta;
                    for (let j = 0; j < this.arcs[i].length; j++) {
                        const object = new THREE.Object3D();
                        object.translateX(-Constants.VALIDATOR_ARC_RADIUS * Math.sin(currentAngle));
                        object.translateY(Constants.VALIDATOR_ARC_RADIUS * Math.cos(currentAngle));
                        rotateAboutPoint(
                            object,
                            new THREE.Vector3(0, object.position.y, 0),
                            new THREE.Vector3(0, 1, 0),
                            rotationY,
                            false,
                        );
                        const scale = this.arcs[i][j]?.scale ?? 0;
                        object.scale.x = scale;
                        object.scale.y = scale;
                        object.scale.z = scale;
                        object.updateMatrix();
                        this.validatorMesh.setMatrixAt(i * this.arcs[0].length + j, object.matrix);
                        this.validatorMesh.setColorAt(
                            i * this.arcs[0].length + j,
                            new THREE.Color(1, 1, 1),
                        );
                        currentAngle += angleDelta;
                    }
                    this.group.rotation.x = (Math.PI / 4) * progress.progress;
                    this.arcMesh.instanceMatrix.needsUpdate = true;
                    this.validatorMesh.instanceMatrix.needsUpdate = true;
                    this.group.rotation.y =
                        currentRotationY * (isReverse ? progress.progress : 1 - progress.progress);
                }
                this.validatorMesh.computeBoundingSphere();
            },
            onComplete,
        ).start();
    }

    rotate() {
        this.group.rotateY(Constants.VALIDATOR_MESH_ROTATE_Y_DELTA);
    }

    reset(onComplete?: () => void) {
        this.animate(true, onComplete);
    }

    private getValidatorIndex(stashAddress: string): number | undefined {
        for (let i = 0; i < this.arcs.length; i++) {
            for (let j = 0; j < this.arcs[i].length; j++) {
                const slot = this.arcs[i][j];
                if (slot) {
                    if (slot.validator.address == stashAddress) {
                        return i * this.arcs[0].length + j;
                    }
                }
            }
        }
        return undefined;
    }

    private getInnerValidatorPosition(index: number): THREE.Vector3 {
        const matrix = new THREE.Matrix4();
        this.validatorMesh.getMatrixAt(index, matrix);
        const position = new THREE.Vector3();
        matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
        return position;
    }

    getValidatorPosition(stashAddress: string): THREE.Vector3 | undefined {
        const index = this.getValidatorIndex(stashAddress);
        if (index == undefined) {
            return undefined;
        }
        const innerPosition = this.getInnerValidatorPosition(index);
        const groupMatrix = new THREE.Matrix4().makeRotationFromEuler(this.group.rotation);
        return innerPosition.applyMatrix4(groupMatrix);
    }

    highlightValidator(index: number) {
        this.highlightedValidatorIndex = index;
        this.resetScales();
    }

    private resetScales() {
        for (let i = 0; i < this.arcs.length; i++) {
            const arcFirstIndex = i * this.arcs[0].length;
            const arcLastIndex = arcFirstIndex + this.arcs[0].length - 1;
            if (this.highlightedParaId) {
                for (let j = 0; j <= this.arcs[0].length; j++) {
                    const index = i * this.arcs[0].length + j;
                    const slot = this.arcs[i][j];
                    if (slot) {
                        let scale = 0.0;
                        if (slot.validator.paraId == this.highlightedParaId) {
                            scale = 1;
                        }
                        const matrix = new THREE.Matrix4();
                        this.validatorMesh.getMatrixAt(index, matrix);
                        matrix.scale(new THREE.Vector3(scale, scale, scale));
                        this.validatorMesh.setMatrixAt(index, matrix);
                    }
                }
                ARC_MATERIAL.opacity = Constants.VALIDATOR_ARC_LOW_OPACITY;
            } else if (this.highlightedValidatorIndex) {
                for (let j = arcFirstIndex; j <= arcLastIndex; j++) {
                    const matrix = new THREE.Matrix4();
                    this.validatorMesh.getMatrixAt(j, matrix);
                    let scale = 0.0;
                    if (j == this.highlightedValidatorIndex) {
                        scale = 2;
                    } else if (
                        this.highlightedValidatorIndex >= arcFirstIndex &&
                        this.highlightedValidatorIndex <= arcLastIndex
                    ) {
                        scale = 1;
                    }
                    matrix.scale(new THREE.Vector3(scale, scale, scale));
                    this.validatorMesh.setMatrixAt(j, matrix);
                }
                ARC_MATERIAL.opacity = Constants.VALIDATOR_ARC_LOW_OPACITY;
            } else {
                for (let j = 0; j < this.arcs[i].length; j++) {
                    const scale = this.arcs[i][j]?.scale ?? 0;
                    const object = new THREE.Object3D();
                    object.scale.x = scale;
                    object.scale.y = scale;
                    object.scale.z = scale;
                    object.updateMatrix();
                    const targetMatrix = object.matrix;
                    const currentMatrix = new THREE.Matrix4();
                    const index = i * this.arcs[0].length + j;
                    this.validatorMesh.getMatrixAt(index, currentMatrix);
                    targetMatrix.copyPosition(currentMatrix);
                    this.validatorMesh.setMatrixAt(index, targetMatrix);
                }
            }
        }
        this.validatorMesh.instanceMatrix.needsUpdate = true;
        this.validatorMesh.computeBoundingSphere();
    }

    clearHighlight() {
        this.highlightedValidatorIndex = undefined;
        this.highlightedParaId = undefined;
        this.resetScales();
        ARC_MATERIAL.opacity = Constants.VALIDATOR_ARC_NORMAL_OPACITY;
    }

    getSlotAtIndex(index: number): ValidatorSlot | undefined {
        const arcIndex = Math.floor(index / this.arcs[0].length);
        const indexInArc = index % this.arcs[0].length;
        return this.arcs[arcIndex][indexInArc];
    }

    highlightParaValidators(paraId: number) {
        this.highlightedParaId = paraId;
        this.resetScales();
    }

    selectValidator(index: number) {
        const position = this.getInnerValidatorPosition(index);
        this.group.add(this.validatorSelectorMesh);
        this.validatorSelectorMesh.position.x = position.x;
        this.validatorSelectorMesh.position.y = position.y;
        this.validatorSelectorMesh.position.z = position.z;
    }

    clearSelection() {
        this.validatorSelectorMesh.removeFromParent();
    }

    onValidatorsAdded(newValidators: ValidatorSummary[]) {
        const count = newValidators.length;
        for (let i = 0; i < this.arcs.length; i++) {
            for (let j = 0; j <= this.arcs[0].length; j++) {
                if (this.arcs[i][j] == undefined) {
                    const validator = newValidators.pop()!;
                    this.arcs[i][j] = {
                        validator: cloneJSONSafeObject(validator),
                        stashAddress: validator.address,
                        scale: 0,
                    };
                }
                if (newValidators.length == 0) {
                    return;
                }
            }
        }
        if (count > 0) {
            this.initScales();
            this.resetScales();
        }
    }

    onValidatorsUpdated(updatedValidators: ValidatorSummary[]) {
        let updatedCount = 0;
        for (const updatedValidator of updatedValidators) {
            for (let i = 0; i < this.arcs.length; i++) {
                for (let j = 0; j <= this.arcs[0].length; j++) {
                    if (this.arcs[i][j]?.stashAddress == updatedValidator.address) {
                        updatedCount++;
                        this.arcs[i][j]!.validator = cloneJSONSafeObject(updatedValidator);
                    }
                }
            }
        }
        if (updatedCount > 0) {
            this.initScales();
            this.resetScales();
        }
    }

    onValidatorsRemoved(removedStashAddresses: string[]) {
        let removedCount = 0;
        for (let i = 0; i < this.arcs.length; i++) {
            for (let j = 0; j <= this.arcs[0].length; j++) {
                const index = i * this.arcs[0].length + j;
                if (removedStashAddresses.indexOf(this.arcs[i][j]?.stashAddress ?? '') >= 0) {
                    removedCount++;
                    this.arcs[i][j] = undefined;
                    if (this.highlightedValidatorIndex == index) {
                        this.highlightedValidatorIndex = undefined;
                    }
                }
            }
        }
        if (removedCount > 0) {
            this.initScales();
            this.resetScales();
        }
    }
}

export { ValidatorMesh };
