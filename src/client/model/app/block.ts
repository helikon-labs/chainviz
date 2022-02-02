import { SignedBlock } from '@polkadot/types/interfaces';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

class Block {
    private readonly mesh: THREE.Group;
    private readonly block: SignedBlock;
    private index: number;

    private readonly indexXOffset = 5;
    private readonly sideLength = 2.3;
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

    constructor(block: SignedBlock, font: Font) {
        this.block = block;
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
                `${this.block.block.header.number.toNumber()}`,
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

    addTo(scene: THREE.Scene, index: number) {
        this.scene = scene;
        this.index = index;
        this.mesh.position.x = -this.index * 5;
        scene.add(this.mesh);
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
        new TWEEN.Tween(
            this.mesh.position
        ).to({
            x: -newIndex * this.indexXOffset
        }, 500).easing(
            TWEEN.Easing.Cubic.Out
        ).start().onComplete(() => {
            // no-op
        });
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