import * as THREE from 'three';

export function rotateAboutPoint(
    obj: THREE.Object3D,
    point: THREE.Vector3,
    axis: THREE.Vector3,
    theta: number,
    pointIsWorld: boolean,
){
    pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

    if(pointIsWorld){
        // compensate for world coordinate
        obj.parent?.localToWorld(obj.position);
    }
    // remove the offset
    obj.position.sub(point);
    // rotate the POSITION
    obj.position.applyAxisAngle(axis, theta);
    // re-add the offset
    obj.position.add(point);
    if(pointIsWorld){
        // undo world coordinates compensation
        obj.parent?.worldToLocal(obj.position); 
    }
    // rotate the OBJECT
    obj.rotateOnAxis(axis, theta);
}