import { Block as SubstrateBlock, SignedBlock } from '@polkadot/types/interfaces';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Constants } from '../../util/constants';
import { createTween } from '../../util/tween_util';
import { rotateAboutPoint } from '../../util/geom_util';

class Block {
    private readonly mesh: THREE.Group;
    readonly substrateBlock: SubstrateBlock;
    private index: number;

    private readonly indexXOffset = 5;
    private readonly sideLength = 2.5;
    private readonly boxMaterial = new THREE.MeshPhongMaterial({
        color: 0x00FF00,
        shininess: 8,
        specular: 0xffffff,
    });
    private readonly textMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FF00
    });
    private boxGeometry!: THREE.BoxGeometry;
    private textGeometry!: TextGeometry;
    private scene!: THREE.Scene;

    constructor(block: SubstrateBlock, font: Font) {
        this.substrateBlock = block;
        this.index = -1;
        this.mesh = this.createMesh(font);
    }

    private createMesh(font: Font): THREE.Group {
        const group = new THREE.Group();
        group.receiveShadow = false;
        // box
        {
            this.boxGeometry = new THREE.BoxGeometry(
                this.sideLength,
                this.sideLength,
                this.sideLength
            );
            group.add(
                new THREE.Mesh(this.boxGeometry, this.boxMaterial)
            );
        }
        // text
        {
            this.textGeometry = new TextGeometry(
                `${this.substrateBlock.header.number.toNumber()}`,
                {
                    font: font,
                    size: 0.45,
                    height: 0,
                    curveSegments: 6,
                }
            );
            const textMesh = new THREE.Mesh(this.textGeometry, this.textMaterial);
            textMesh.position.x = -1.5;
            textMesh.position.y = -2.2;
            group.add(textMesh);
        }
        return group;
    }

    addTo(scene: THREE.Scene) {
        this.scene = scene;
        this.index = 0;
        this.mesh.position.x = -this.index * 5;
        scene.add(this.mesh);
    }

    spawn(
        scene: THREE.Scene,
        validatorIndex: [number, number],
        ringSize: number,
        onComplete: () => void,
    ) {
        this.scene = scene;
        this.index = 0;
        this.mesh.rotation.z = Math.PI / 2;
        this.mesh.position.z = Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z;
        const [ringIndex, index] = validatorIndex;
        this.mesh.position.x = -22 - (ringIndex * 5) + 6;
        rotateAboutPoint(
            this.mesh,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - index * ((11 * Math.PI / 6) / ringSize),
            false,
        );
        this.mesh.scale.x = 0;
        this.mesh.scale.y = 0;
        this.mesh.scale.z = 0;
        scene.add(this.mesh);
        createTween(
            this.mesh.scale,
            { x: 1, y: 1, z: 1 },
            Constants.BLOCK_SPAWN_SCALE_CURVE,
            Constants.BLOCK_SPAWN_SCALE_TIME_MS,
            undefined,
            () => {
                setTimeout(() => {
                    this.resetToOrigin(onComplete);
                }, 250);
            }
        ).start();
    }

    private resetToOrigin(onComplete: () => void) {
        let rotationTween = createTween(
            this.mesh.rotation,
            { x: 0, y: 0, z: 0 },
            Constants.BLOCK_TO_ORIGIN_CURVE,
            Constants.BLOCK_TO_ORIGIN_TIME_MS,
        );
        createTween(
            this.mesh.position,
            { x: 0, y: 0, z: 0 },
            Constants.BLOCK_TO_ORIGIN_CURVE,
            Constants.BLOCK_TO_ORIGIN_TIME_MS,
            () => { rotationTween.start(); },
            () => { onComplete(); },
        ).start();
    }

    getIndex(): number {
        return this.index;
    }

    setIndex(
        newIndex: number,
        animated: boolean = false
    ) {
        this.index = newIndex;
        if (!animated) {
            this.mesh.position.x = -newIndex * 5;
            return;
        }
        createTween(
            this.mesh.position,
            { x: -newIndex * this.indexXOffset },
            Constants.BLOCK_SHIFT_CURVE,
            Constants.BLOCK_SHIFT_TIME_MS,
        ).start();
    }

    removeAndDispose() {
        this.scene.remove(this.mesh);
        this.boxGeometry.dispose();
        this.textGeometry.dispose();
        this.boxMaterial.dispose();
        this.textMaterial.dispose();
    }
}

export { Block };