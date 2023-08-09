import * as THREE from 'three';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';
import { getOnScreenPosition, rotateAboutPoint } from '../util/geometry';

const ARC_GEOMETRY = new THREE.TorusGeometry(Constants.VALIDATOR_ARC_RADIUS, 0.06, 12, 36, Math.PI);
ARC_GEOMETRY.rotateZ(Math.PI / 2);

const ARC_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_ARC_COLOR,
    transparent: true,
    opacity: 0.6,
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

class ValidatorMesh {
    private arcMesh!: THREE.InstancedMesh;
    private validatorMesh!: THREE.InstancedMesh;
    private group!: THREE.Group;
    private validatorCount = 0;
    private arcCount = 0;
    private validatorsPerArc = 0;
    private readonly validatorScales: number[] = [];
    private validatorMap!: Map<string, ValidatorSummary>;

    start(
        scene: THREE.Scene,
        validatorMap: Map<string, ValidatorSummary>,
        onComplete?: () => void,
    ) {
        this.validatorMap = validatorMap;
        if (this.group) {
            scene.remove(this.group);
        }
        this.group = new THREE.Group();
        this.validatorCount = validatorMap.size;

        this.arcCount = Constants.MIN_ARC_COUNT;
        this.validatorsPerArc = Math.ceil(validatorMap.size / this.arcCount);
        while (this.validatorsPerArc > Constants.MAX_VALIDATORS_PER_ARC) {
            this.arcCount++;
            this.validatorsPerArc = Math.ceil(validatorMap.size / this.arcCount);
        }
        this.arcMesh = new THREE.InstancedMesh(ARC_GEOMETRY, ARC_MATERIAL, this.arcCount);
        this.arcMesh.userData = {
            type: 'arc',
        };
        this.group.add(this.arcMesh);
        this.validatorMesh = new THREE.InstancedMesh(
            VALIDATOR_GEOMETRY,
            VALIDATOR_MATERIAL,
            validatorMap.size,
        );
        const validatorMapKeys = Array.from(validatorMap.keys());
        this.validatorMesh.userData = {
            type: 'validator',
            stashAddresses: validatorMapKeys,
        };
        this.group.add(this.validatorMesh);
        scene.add(this.group);
        const minScale =
            Constants.VALIDATOR_SPHERE_MIN_RADIUS / Constants.VALIDATOR_SPHERE_MAX_RADIUS;
        let maxRewardPoints = 0;
        let minRewardPoints = Number.MAX_SAFE_INTEGER;
        for (const validator of this.validatorMap.values()) {
            maxRewardPoints = Math.max(maxRewardPoints, validator.rewardPoints);
            minRewardPoints = Math.min(minRewardPoints, validator.rewardPoints);
        }
        const scaleStep = (1.0 - minScale) / (maxRewardPoints - minRewardPoints);
        for (let i = 0; i < validatorMapKeys.length; i++) {
            const validator = this.validatorMap.get(validatorMapKeys[i])!;
            const scale = minScale + scaleStep * (validator.rewardPoints - minRewardPoints);
            this.validatorScales.push(scale);
        }
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
                for (let i = 0; i < this.arcCount; i++) {
                    let rotationY = i * ((2 * Math.PI) / this.arcCount) * progress.progress;
                    if (i >= this.arcCount / 2) {
                        const target =
                            ((i - this.arcCount / 2) * Math.PI) / Math.ceil(this.arcCount / 2);
                        rotationY = Math.PI + target * progress.progress;
                    }
                    const object = new THREE.Object3D();
                    object.rotation.y = rotationY;
                    object.updateMatrix();
                    this.arcMesh.setMatrixAt(i, object.matrix);
                    // update validators
                    const angleDelta = Math.PI / (this.validatorsPerArc + 1);
                    let currentAngle = angleDelta;
                    for (let j = 0; j < this.validatorsPerArc; j++) {
                        const k = i * this.validatorsPerArc + j;
                        if (k >= this.validatorCount) {
                            break;
                        }
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
                        object.scale.x = this.validatorScales[k];
                        object.scale.y = this.validatorScales[k];
                        object.scale.z = this.validatorScales[k];
                        object.updateMatrix();
                        this.validatorMesh.setMatrixAt(k, object.matrix);
                        currentAngle += angleDelta;
                    }
                    this.group.rotation.x = (Math.PI / 4) * progress.progress;
                    this.arcMesh.instanceMatrix.needsUpdate = true;
                    this.validatorMesh.instanceMatrix.needsUpdate = true;
                    this.validatorMesh.computeBoundingSphere();
                    this.group.rotation.y =
                        currentRotationY * (isReverse ? progress.progress : 1 - progress.progress);
                }
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

    getOnScreenPositionOfValidator(
        index: number,
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera,
    ): THREE.Vec2 {
        const groupMatrix = new THREE.Matrix4().makeRotationFromEuler(this.group.rotation);
        const matrix = new THREE.Matrix4();
        this.validatorMesh.getMatrixAt(index, matrix);
        const position = new THREE.Vector3();
        matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
        return getOnScreenPosition(position.applyMatrix4(groupMatrix), renderer, camera);
    }

    highlightValidator(index: number) {
        for (let i = 0; i < this.validatorMesh.count; i++) {
            const matrix = new THREE.Matrix4();
            this.validatorMesh.getMatrixAt(i, matrix);
            const scale = index == i ? 2 : 0;
            matrix.scale(new THREE.Vector3(scale, scale, scale));
            this.validatorMesh.setMatrixAt(i, matrix);
        }
        this.validatorMesh.instanceMatrix.needsUpdate = true;
        this.validatorMesh.computeBoundingSphere();
    }

    private resetScales() {
        for (let i = 0; i < this.validatorMesh.count; i++) {
            const scale = this.validatorScales[i];
            const object = new THREE.Object3D();
            object.scale.x = scale;
            object.scale.y = scale;
            object.scale.z = scale;
            const currentMatrix = new THREE.Matrix4();
            this.validatorMesh.getMatrixAt(i, currentMatrix);
            object.updateMatrix();
            const targetMatrix = object.matrix;
            targetMatrix.copyPosition(currentMatrix);
            this.validatorMesh.setMatrixAt(i, targetMatrix);
        }
        this.validatorMesh.instanceMatrix.needsUpdate = true;
        this.validatorMesh.computeBoundingSphere();
    }

    clearHighlight() {
        console.log('reset scale');
        this.resetScales();
    }
}

export { ValidatorMesh };
