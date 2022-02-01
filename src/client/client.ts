import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ChainViz } from './chainviz';

/*
const wsProvider = new WsProvider('wss://rpc.polkadot.io');
ApiPromise
    .create({ provider: wsProvider })
    .then((api) =>
        console.log(api.genesisHash.toHex())
    );
    */

// scene


// light
/*
const light1 = new THREE.SpotLight()
light1.intensity = 0.5
light1.position.set(5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.mapSize.width = 600
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 0.5
light1.shadow.camera.far = 20
scene.add(light1)
*/


/*
for (let i = 0; i <= 7; i++) {
    let validator = createValidator();
    validator.position.x = i * 7;
    scene.add(validator);
}
*/

let chainViz = new ChainViz();
chainViz.start();