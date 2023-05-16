import { Block as SubstrateBlock } from '@polkadot/types/interfaces';
import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Constants } from '../../util/constants';
import { createTween } from '../../util/tween';
import { rotateAboutPoint } from '../../util/geometry';

class Block {
    private readonly mesh: THREE.Group;
    private readonly substrateBlock: SubstrateBlock;
    private sibling?: Block = undefined;
    private index: number;

    private static blockNumberFont: Font;

    static {
        new FontLoader().load('./font/fira_mono_regular.typeface.json', (font) => {
            Block.blockNumberFont = font;
        });
    }

    private readonly indexXOffset = 5;
    private readonly sideLength = 2.5;
    private readonly boxMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        shininess: 8,
        specular: 0xffffff,
    });
    private readonly blockNumberTextMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
    });
    private readonly finalizedTextMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
    });
    private boxGeometry!: THREE.BoxGeometry;
    private blockNumberTextGeometry!: TextGeometry;
    private finalizedTextGeometry!: TextGeometry;
    private finalizedTextMesh!: THREE.Mesh;
    private scene!: THREE.Scene;
    private isFinalized: boolean;

    constructor(block: SubstrateBlock, isFinalized = false) {
        this.substrateBlock = block;
        this.index = -1;
        this.isFinalized = isFinalized;
        this.mesh = this.createMesh(Block.blockNumberFont);
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
            group.add(new THREE.Mesh(this.boxGeometry, this.boxMaterial));
        }
        // block number
        {
            this.blockNumberTextGeometry = new TextGeometry(
                `${this.substrateBlock.header.number.toNumber()}`,
                {
                    font: font,
                    size: 0.45,
                    height: 0,
                    curveSegments: 6,
                }
            );
            const mesh = new THREE.Mesh(this.blockNumberTextGeometry, this.blockNumberTextMaterial);
            mesh.position.x = -1.5;
            mesh.position.y = -2.2;
            group.add(mesh);
        }
        // finalized
        {
            this.finalizedTextGeometry = new TextGeometry('+', {
                font: font,
                size: 2,
                height: 0,
                curveSegments: 6,
            });
            const mesh = new THREE.Mesh(this.finalizedTextGeometry, this.finalizedTextMaterial);
            mesh.position.x = -0.8;
            mesh.position.y = -0.85;
            mesh.position.z = 1.3;
            mesh.visible = this.isFinalized;
            group.add(mesh);
            this.finalizedTextMesh = mesh;
        }
        return group;
    }

    addTo(scene: THREE.Scene) {
        this.scene = scene;
        this.index = 0;
        this.mesh.position.x = -this.index * 5;
        if (this.sibling) {
            this.mesh.position.y = Constants.BLOCK_FORK_DELTA_Y;
        }
        scene.add(this.mesh);
    }

    setSibling(sibling: Block) {
        this.sibling = sibling;
    }

    getNumber(): number {
        return this.substrateBlock.header.number.toNumber();
    }

    getHashHex(): string {
        return this.substrateBlock.header.hash.toHex();
    }

    getParentHashHex(): string {
        return this.substrateBlock.header.parentHash.toHex();
    }

    async fork(animated: boolean, onComplete?: () => void) {
        if (!animated) {
            this.mesh.position.y = -Constants.BLOCK_FORK_DELTA_Y;
            this.mesh.updateMatrix();
            return;
        }
        createTween(
            this.mesh.position,
            { x: 0, y: -Constants.BLOCK_FORK_DELTA_Y, z: 0 },
            Constants.BLOCK_SHIFT_CURVE,
            Constants.BLOCK_SHIFT_TIME_MS,
            undefined,
            undefined,
            () => {
                if (onComplete) {
                    onComplete();
                }
            }
        ).start();
    }

    spawn(
        scene: THREE.Scene,
        validatorIndex: [number, number],
        ringSize: number,
        onComplete: () => void
    ) {
        this.scene = scene;
        this.index = 0;
        this.mesh.rotation.z = Math.PI / 2;
        this.mesh.position.z = Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z;
        const [ringIndex, index] = validatorIndex;
        this.mesh.position.x = -22 - ringIndex * 5 + 6;
        rotateAboutPoint(
            this.mesh,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - index * ((11 * Math.PI) / 6 / ringSize),
            false
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
            undefined,
            () => {
                setTimeout(() => {
                    this.resetToOrigin(onComplete);
                }, 250);
            }
        ).start();
    }

    private resetToOrigin(onComplete: () => void) {
        const rotationTween = createTween(
            this.mesh.rotation,
            { x: 0, y: 0, z: 0 },
            Constants.BLOCK_TO_ORIGIN_CURVE,
            Constants.BLOCK_TO_ORIGIN_TIME_MS
        );
        createTween(
            this.mesh.position,
            { x: 0, y: this.sibling ? Constants.BLOCK_FORK_DELTA_Y : 0, z: 0 },
            Constants.BLOCK_TO_ORIGIN_CURVE,
            Constants.BLOCK_TO_ORIGIN_TIME_MS,
            () => {
                rotationTween.start();
            },
            undefined,
            () => {
                onComplete();
            }
        ).start();
    }

    getIndex(): number {
        return this.index;
    }

    setIndex(newIndex: number, animated = false) {
        this.index = newIndex;
        if (!animated) {
            this.mesh.position.x = -newIndex * 5;
            this.mesh.updateMatrix();
            return;
        }
        createTween(
            this.mesh.position,
            { x: -newIndex * this.indexXOffset },
            Constants.BLOCK_SHIFT_CURVE,
            Constants.BLOCK_SHIFT_TIME_MS
        ).start();
    }

    finalize(animated: boolean) {
        if (this.sibling) {
            this.sibling.removeAndDispose();
            this.sibling = undefined;
            if (animated) {
                createTween(
                    this.mesh.position,
                    { x: this.mesh.position.x, y: 0, z: 0 },
                    Constants.BLOCK_TO_ORIGIN_CURVE,
                    Constants.BLOCK_TO_ORIGIN_TIME_MS
                ).start();
            } else {
                this.mesh.position.y = 0;
                this.mesh.updateMatrix();
            }
        }
        this.finalizedTextMesh.visible = true;
    }

    removeAndDispose() {
        this.scene.remove(this.mesh);
        this.boxGeometry.dispose();
        this.boxMaterial.dispose();
        this.blockNumberTextGeometry.dispose();
        this.blockNumberTextMaterial.dispose();
        this.finalizedTextGeometry.dispose();
        this.finalizedTextMaterial.dispose();
    }
}

export { Block };
