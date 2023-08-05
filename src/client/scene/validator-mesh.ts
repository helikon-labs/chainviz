import * as THREE from 'three';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

const VALIDATOR_GEOMETRY = new THREE.SphereGeometry(
    Constants.VALIDATOR_SPHERE_MAX_RADIUS,
    Constants.VALIDATOR_SPHERE_WIDTH_SEGMENTS,
    Constants.VALIDATOR_SPHERE_HEIGHT_SEGMENTS,
);
const ARC_CURVE = new THREE.EllipseCurve(
    0,
    0, // aX, aY
    Constants.VALIDATOR_ARC_RADIUS,
    Constants.VALIDATOR_ARC_RADIUS,
    Math.PI / 2, // start angle
    (3 * Math.PI) / 2, // end angle
    false, // clockwise
    0, // rotation
);
const ARC_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_ARC_COLOR,
    transparent: true,
    opacity: 0.6,
});
const VALIDATOR_MATERIAL = new THREE.MeshBasicMaterial({
    color: Constants.VALIDATOR_SPHERE_COLOR,
    transparent: true,
    opacity: Constants.SCENE_VALIDATOR_OPACITY,
});

class ValidatorArc {
    private readonly validators: Map<string, ValidatorSummary>;
    private readonly mesh: THREE.InstancedMesh;
    private readonly arc: THREE.Line;
    private readonly group: THREE.Group;

    constructor(
        validatorMap: Map<string, ValidatorSummary>,
        maxRewardPoints: number,
        arcCount: number,
        arcIndex: number,
    ) {
        const arcPoints = ARC_CURVE.getPoints(Constants.VALIDATOR_ARC_POINTS);
        const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        this.arc = new THREE.Line(arcGeometry, ARC_MATERIAL);
        this.validators = validatorMap;
        this.mesh = new THREE.InstancedMesh(
            VALIDATOR_GEOMETRY,
            VALIDATOR_MATERIAL,
            validatorMap.size,
        );
        const angleDelta = Math.PI / (validatorMap.size + 1);
        let currentAngle = angleDelta;
        const validatorMapKeys = Array.from(validatorMap.keys());
        for (let j = 0; j < validatorMapKeys.length; j++) {
            const validator = validatorMap.get(validatorMapKeys[j])!;
            const object = new THREE.Object3D();
            object.translateX(-Constants.VALIDATOR_ARC_RADIUS * Math.sin(currentAngle));
            object.translateY(Constants.VALIDATOR_ARC_RADIUS * Math.cos(currentAngle));
            const scale = Math.max(
                validator.rewardPoints / maxRewardPoints,
                Constants.VALIDATOR_SPHERE_MIN_RADIUS / Constants.VALIDATOR_SPHERE_MAX_RADIUS,
            );
            object.scale.x = scale;
            object.scale.y = scale;
            object.scale.z = scale;
            object.updateMatrix();
            this.mesh.setMatrixAt(j, object.matrix);
            currentAngle += angleDelta;
        }
        const group = new THREE.Group();
        group.add(this.mesh);
        group.add(this.arc);
        if (arcIndex >= arcCount / 2) {
            group.rotation.y = Math.PI;
        }
        group.updateMatrix();
        this.group = group;
    }

    addToGroup(group: THREE.Group) {
        group.add(this.group);
    }
}

class ValidatorMesh {
    private group!: THREE.Group;

    start(
        scene: THREE.Scene,
        validatorMap: Map<string, ValidatorSummary>,
        onComplete?: () => void,
    ) {
        if (this.group) {
            scene.remove(this.group);
        }
        this.group = new THREE.Group();
        let maxRewardPoints = 0;
        for (const validator of validatorMap.values()) {
            if (validator.rewardPoints > maxRewardPoints) {
                maxRewardPoints = validator.rewardPoints;
            }
        }
        let arcCount = Constants.MIN_ARC_COUNT;
        let validatorsPerArc = Math.ceil(validatorMap.size / arcCount);
        while (validatorsPerArc > Constants.MAX_VALIDATORS_PER_ARC) {
            arcCount++;
            validatorsPerArc = Math.ceil(validatorMap.size / arcCount);
        }
        let index = 0;
        while (index < validatorMap.size) {
            const endIndex = Math.min(index + validatorsPerArc, validatorMap.size - 1);
            const arcValidatorMap = new Map(Array.from(validatorMap).slice(index, endIndex));
            const arc = new ValidatorArc(
                arcValidatorMap,
                maxRewardPoints,
                arcCount,
                Math.floor(index / validatorsPerArc),
            );
            arc.addToGroup(this.group);
            index += validatorsPerArc;
        }
        scene.add(this.group);
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
                for (let i = 0; i < this.group.children.length; i++) {
                    let rotationY =
                        i * ((2 * Math.PI) / this.group.children.length) * progress.progress;
                    if (i >= this.group.children.length / 2) {
                        const target =
                            ((i - this.group.children.length / 2) * Math.PI) /
                            Math.ceil(this.group.children.length / 2);
                        rotationY = Math.PI + target * progress.progress;
                    }
                    this.group.children[i].rotation.y = rotationY;
                    this.group.children[i].updateMatrix();
                    this.group.rotation.x = Constants.VALIDATOR_MESH_ROTATE_X * progress.progress;
                    this.group.rotation.y =
                        currentRotationY * (isReverse ? progress.progress : 1 - progress.progress);
                    this.group.updateMatrix();
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
}

export { ValidatorMesh };
