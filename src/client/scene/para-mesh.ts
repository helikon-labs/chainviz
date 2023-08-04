import { Para } from '../model/substrate/para';
import * as THREE from 'three';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

class ParaMesh {
    private readonly group: THREE.Group;

    constructor() {
        this.group = new THREE.Group();
    }

    start(scene: THREE.Scene, paras: Para[]) {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: Constants.PARAS_CROSSHAIR_COLOR,
            transparent: true,
            opacity: Constants.PARAS_CROSSHAIR_OPACITY,
        });
        let linePoints = [];
        linePoints.push(new THREE.Vector3(-Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        linePoints.push(new THREE.Vector3(Constants.PARAS_CROSSHAIR_HORIZONTAL_RADIUS, 0, 0));
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        let line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(line);

        linePoints = [];
        linePoints.push(new THREE.Vector3(0, Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        linePoints.push(new THREE.Vector3(0, -Constants.PARAS_CROSSHAIR_VERTICAL_RADIUS, 0));
        lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(line);

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
        this.startInitialAnimation();
    }

    private startInitialAnimation() {
        const progress = { progress: 0.0 };
        const initialRadius = Constants.VALIDATOR_ARC_RADIUS;
        const deltaRadius = Constants.PARAS_CIRCLE_RADIUS - Constants.VALIDATOR_ARC_RADIUS;
        setTimeout(() => {
            createTween(
                progress,
                { progress: 1.0 },
                TWEEN.Easing.Exponential.InOut,
                2000,
                undefined,
                () => {
                    for (let i = 2; i < this.group.children.length; i++) {
                        const angle = (Math.PI / (this.group.children.length - 2)) * 2 * (i - 2);
                        for (const child of this.group.children[i].children) {
                            if (child instanceof THREE.Mesh) {
                                child.material.opacity = progress.progress;
                            }
                            child.scale.x = progress.progress;
                            child.scale.y = progress.progress;
                            child.scale.z = progress.progress;
                            const radius = initialRadius + deltaRadius * progress.progress;
                            child.position.set(
                                Math.sin(angle) * radius,
                                Math.cos(angle) * radius,
                                0,
                            );
                            child.updateMatrix();
                        }
                    }
                },
            ).start();
        }, 100);
    }
}

export { ParaMesh };
