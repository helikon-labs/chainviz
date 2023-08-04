import { Para } from '../model/substrate/para';
import * as THREE from 'three';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

class ParaMesh {
    private group!: THREE.Group;

    start(scene: THREE.Scene, paras: Para[]) {
        if (this.group) {
            scene.remove(this.group);
        }
        this.group = new THREE.Group();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: Constants.PARAS_CROSSHAIR_COLOR,
            transparent: true,
            opacity: Constants.PARAS_CROSSHAIR_OPACITY,
        });
        // horizontal line
        let linePoints = [];
        linePoints.push(new THREE.Vector3(-Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        linePoints.push(new THREE.Vector3(Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        let line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(line);
        // vertical line
        linePoints = [];
        linePoints.push(new THREE.Vector3(0, Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        linePoints.push(new THREE.Vector3(0, -Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(line);
        // ring
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
        const backgroundGeometry = new THREE.CircleGeometry(Constants.PARA_BG_RADIUS);
        const logoGeometry = new THREE.CircleGeometry(Constants.PARA_LOGO_RADIUS);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: Constants.PARA_BG_COLOR,
            transparent: true,
            opacity: Constants.PARA_BG_OPACITY,
        });
        for (let i = 0; i < paras.length; i++) {
            const para = paras[i];
            const paraGroup = new THREE.Group();
            const angle = (Math.PI / paras.length) * 2 * i;
            // add background circle
            const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
            background.position.set(
                Math.sin(angle) * initialRadius,
                Math.cos(angle) * initialRadius,
                0,
            );
            background.material.opacity = 0;
            paraGroup.add(background);

            // add logo
            const logoTexture = new THREE.TextureLoader().load('/img/paras/' + para.ui.logo);
            const logoMaterial = new THREE.MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
                opacity: 1.0,
            });
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(Math.sin(angle) * initialRadius, Math.cos(angle) * initialRadius, 0);
            logo.material.opacity = 0;
            paraGroup.add(logo);
            // add to the main group
            this.group.add(paraGroup);
        }
        scene.add(this.group);
        this.animate(false);
    }

    private animate(isReverse: boolean) {
        const progress = { progress: isReverse ? 1.0 : 0.0 };
        const initialRadius = Constants.VALIDATOR_ARC_RADIUS;
        const deltaRadius = Constants.PARAS_CIRCLE_RADIUS - Constants.VALIDATOR_ARC_RADIUS;
        createTween(
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
                            child.material.opacity = progress.progress;
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
        ).start();
    }

    reset() {
        this.animate(true);
    }
}

export { ParaMesh };
