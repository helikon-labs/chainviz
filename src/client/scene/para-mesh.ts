import { Para } from '../model/substrate/para';
import * as THREE from 'three';
import { Constants } from '../util/constants';

class ParaMesh {
    private readonly group: THREE.Group;

    constructor() {
        this.group = new THREE.Group();
    }

    init(paras: Para[]) {
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

        const radius = Constants.PARAS_CIRCLE_RADIUS;
        const delta = (Math.PI / paras.length) * 2;
        let current = 0.0;
        const backgroundGeometry = new THREE.CircleGeometry(Constants.PARA_BG_RADIUS);
        const logoGeometry = new THREE.CircleGeometry(Constants.PARA_LOGO_RADIUS);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: Constants.PARA_BG_COLOR,
            transparent: true,
            opacity: Constants.PARA_BG_OPACITY,
        });
        for (const para of paras) {
            // add background circle
            const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
            background.position.set(Math.sin(current) * radius, Math.cos(current) * radius, 0);
            this.group.add(background);
            // add logo
            const logoTexture = new THREE.TextureLoader().load('/img/paras/' + para.ui.logo);
            const logoMaterial = new THREE.MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
                opacity: 1.0,
            });
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(Math.sin(current) * radius, Math.cos(current) * radius, 0);
            this.group.add(logo);
            current += delta;
        }
    }

    addToScene(scene: THREE.Scene) {
        scene.add(this.group);
    }
}

export { ParaMesh };
