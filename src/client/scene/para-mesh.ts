import { Para } from '../model/substrate/para';
import * as THREE from 'three';
import { Constants } from '../util/constants';
import { createTween, startTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

const CROSSHAIR_LINE_MATERIAL = new THREE.LineBasicMaterial({
    color: Constants.PARAS_CROSSHAIR_COLOR,
    transparent: true,
    opacity: Constants.PARAS_CROSSHAIR_OPACITY,
});

/**
 * 3D paravalidator mesh view.
 */
class ParaMesh {
    private group!: THREE.Group;

    /**
     * Does the initial construction of the mesh and animation.
     * @param scene
     * @param paras
     */
    start(scene: THREE.Scene, paras: Para[]) {
        // clear data if exists
        if (this.group) {
            scene.remove(this.group);
        }
        this.group = new THREE.Group();
        // add horizontal crosshair line
        let linePoints = [];
        linePoints.push(new THREE.Vector3(-Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        linePoints.push(new THREE.Vector3(Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        let line = new THREE.Line(lineGeometry, CROSSHAIR_LINE_MATERIAL);
        this.group.add(line);
        // add vertical crosshair line
        linePoints = [];
        linePoints.push(new THREE.Vector3(0, Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        linePoints.push(new THREE.Vector3(0, -Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        line = new THREE.Line(lineGeometry, CROSSHAIR_LINE_MATERIAL);
        this.group.add(line);
        // add ring
        const ringMaterial = new THREE.LineBasicMaterial({
            color: Constants.PARAS_CROSSHAIR_COLOR,
            transparent: true,
            opacity: 0.0,
        });
        const ringGeometry = new THREE.RingGeometry(
            Constants.VALIDATOR_ARC_RADIUS,
            Constants.VALIDATOR_ARC_RADIUS + 0.075,
            64,
        );
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.group.add(ring);

        const initialRadius = Constants.VALIDATOR_ARC_RADIUS;
        const logoGeometry = new THREE.CircleGeometry(Constants.PARA_LOGO_RADIUS);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: Constants.PARA_BG_COLOR,
            transparent: true,
            opacity: Constants.PARA_BG_OPACITY,
        });
        backgroundMaterial.side = THREE.DoubleSide;
        for (let i = 0; i < paras.length; i++) {
            const para = paras[i];
            const paraGroup = new THREE.Group();
            const angle = (Math.PI / paras.length) * 2 * i;
            // add logo
            const logoTexture = new THREE.TextureLoader().load('/img/paras/' + para.ui.logo);
            const logoMaterial = new THREE.MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
                opacity: 1.0,
            });
            logoMaterial.side = THREE.DoubleSide;
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(Math.sin(angle) * initialRadius, Math.cos(angle) * initialRadius, 0);
            logo.material.opacity = 0;
            logo.userData = {
                type: 'para',
                paraId: para.paraId,
            };
            paraGroup.add(logo);
            // add to the main group
            this.group.add(paraGroup);
        }
        scene.add(this.group);
        this.animate(false);
    }

    /**
     * Startup or stop animation.
     *
     * @param isReverse true for the animation before a network change
     */
    private animate(isReverse: boolean) {
        const progress = { progress: isReverse ? 1.0 : 0.0 };
        const initialRadius = Constants.VALIDATOR_ARC_RADIUS;
        const deltaRadius = Constants.PARAS_CIRCLE_RADIUS - Constants.VALIDATOR_ARC_RADIUS;
        const tween = createTween(
            progress,
            { progress: isReverse ? 0.0 : 1.0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.SCENE_STATE_TRANSITION_ANIM_DURATION_MS,
            undefined,
            () => {
                const ring = this.group.children[2];
                if (ring instanceof THREE.Mesh) {
                    const scale =
                        (Constants.PARAS_CIRCLE_RADIUS / Constants.VALIDATOR_ARC_RADIUS - 1) *
                            progress.progress +
                        1;
                    ring.scale.x = scale;
                    ring.scale.y = scale;
                    ring.material.opacity = progress.progress * Constants.PARAS_CROSSHAIR_OPACITY;
                }
                for (let i = 3; i < this.group.children.length; i++) {
                    const angle = (Math.PI / (this.group.children.length - 3)) * 2 * (i - 3);
                    for (const child of this.group.children[i].children) {
                        if (child instanceof THREE.Mesh) {
                            child.material.opacity =
                                progress.progress * Constants.SCENE_PARA_OPACITY;
                        }
                        child.scale.x = progress.progress;
                        child.scale.y = progress.progress;
                        child.scale.z = progress.progress;
                        const radius = initialRadius + deltaRadius * progress.progress;
                        child.position.set(Math.sin(angle) * radius, Math.cos(angle) * radius, 0);
                        child.updateMatrix();
                    }
                }
            },
        );
        startTween(tween);
    }

    /**
     * Get local position of a para icon.
     *
     * @param paraId para id
     * @returns position if para with the given id exists, undefined otherwise
     */
    getParaPosition(paraId: number): THREE.Vector3 | undefined {
        for (let i = 3; i < this.group.children.length; i++) {
            for (const child of this.group.children[i].children) {
                if (child.userData?.type == 'para' && child.userData?.paraId == paraId) {
                    return child.position.clone();
                }
            }
        }
        return undefined;
    }

    /**
     * Highlights the paras with the given ids
     *
     * @param paraIds para ids
     */
    highlightParas(paraIds: number[]) {
        for (let i = 3; i < this.group.children.length; i++) {
            for (const child of this.group.children[i].children) {
                if (paraIds.indexOf(child.userData?.paraId) >= 0) {
                    if (child instanceof THREE.Mesh) {
                        if (child.userData?.type == 'para') {
                            child.material.opacity = 1.0;
                        }
                        child.scale.x = Constants.HIGHLIGHTED_PARA_SCALE;
                        child.scale.y = Constants.HIGHLIGHTED_PARA_SCALE;
                        child.scale.z = Constants.HIGHLIGHTED_PARA_SCALE;
                    }
                }
            }
        }
    }

    /**
     * Clear any highlight.
     */
    clearHighlight() {
        for (let i = 3; i < this.group.children.length; i++) {
            for (const child of this.group.children[i].children) {
                if (child.userData?.paraId != undefined) {
                    if (child instanceof THREE.Mesh) {
                        if (child.userData?.type == 'para') {
                            child.material.opacity = Constants.SCENE_PARA_OPACITY;
                        }
                        child.scale.x = 1;
                        child.scale.y = 1;
                        child.scale.z = 1;
                    }
                }
            }
        }
    }

    /**
     * Called before a network change.
     */
    reset() {
        this.animate(true);
    }
}

export { ParaMesh };
