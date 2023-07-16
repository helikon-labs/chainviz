import * as THREE from 'three';
import { ChainvizScene } from './scene';

THREE.Cache.enabled = true;

class Chainviz {
    private scene = new ChainvizScene();

    constructor() {}

    async init() {}
}

export { Chainviz };
