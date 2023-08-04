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
const VALIDATOR_MATERIAL = new THREE.MeshBasicMaterial({ color: Constants.VALIDATOR_SPHERE_COLOR });

class ValidatorArc {
    private readonly validators: Map<string, ValidatorSummary>;
    private readonly mesh: THREE.InstancedMesh;
    private readonly arc: THREE.Line;
    private readonly group: THREE.Group;

    constructor(
        validatorMap: Map<string, ValidatorSummary>,
        maxRewardPoints: number,
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
        const angleDelta =
            Math.PI / (arcIndex == 0 ? validatorMap.size - 1 : validatorMap.size + 1);
        let currentAngle = arcIndex == 0 ? 0 : angleDelta;
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
        group.updateMatrix();
        this.group = group;
    }

    addToGroup(group: THREE.Group) {
        group.add(this.group);
    }
}

class ValidatorMesh {
    private readonly group: THREE.Group;

    constructor() {
        this.group = new THREE.Group();
    }

    start(scene: THREE.Scene, validatorMap: Map<string, ValidatorSummary>) {
        const maxRewardPoints = Math.max(
            ...Array.from(validatorMap.values()).map((validator) => validator.rewardPoints),
        );
        let arcCount = Constants.MIN_ARC_COUNT;
        let validatorsPerArc = validatorMap.size / arcCount;
        while (validatorsPerArc > Constants.MAX_VALIDATORS_PER_ARC) {
            arcCount++;
            validatorsPerArc = validatorMap.size / arcCount;
        }
        for (let i = 0; i < arcCount; i++) {
            const beginIndex = i * validatorsPerArc;
            const endIndex = Math.min(i * validatorsPerArc + validatorsPerArc, validatorMap.size);
            const arcValidatorMap = new Map(Array.from(validatorMap).slice(beginIndex, endIndex));
            const arc = new ValidatorArc(arcValidatorMap, maxRewardPoints, i);
            arc.addToGroup(this.group);
        }
        scene.add(this.group);
        this.startInitialAnimation();
    }

    private startInitialAnimation() {
        const progress = { progress: 0.0 };
        setTimeout(() => {
            createTween(
                progress,
                { progress: 1.0 },
                TWEEN.Easing.Exponential.InOut,
                2000,
                undefined,
                () => {
                    for (let i = 0; i < this.group.children.length; i++) {
                        const rotationY =
                            i * ((2 * Math.PI) / this.group.children.length) * progress.progress;
                        this.group.children[i].rotation.y = rotationY;
                        this.group.children[i].updateMatrix();
                        this.group.rotation.x =
                            Constants.VALIDATOR_MESH_ROTATE_X * progress.progress;
                        this.group.updateMatrix();
                    }
                },
            ).start();
        }, 100);
    }

    animate() {
        this.group.rotateY(Constants.VALIDATOR_MESH_ROTATE_Y_DELTA);
    }
}

export { ValidatorMesh };
