import * as THREE from 'three';

/**
 * Rotates an object around a pivot point in 3D space.
 *
 * @param obj object to be rotated
 * @param point pivot point
 * @param axis
 * @param theta rotation angle
 * @param pointIsWorld whether to compensate for world coordinate
 */
function rotateAboutPoint(
    obj: THREE.Object3D,
    point: THREE.Vector3,
    axis: THREE.Vector3,
    theta: number,
    pointIsWorld: boolean,
) {
    pointIsWorld = pointIsWorld === undefined ? false : pointIsWorld;

    if (pointIsWorld) {
        // compensate for world coordinate
        obj.parent?.localToWorld(obj.position);
    }
    // remove the offset
    obj.position.sub(point);
    // rotate the POSITION
    obj.position.applyAxisAngle(axis, theta);
    // re-add the offset
    obj.position.add(point);
    if (pointIsWorld) {
        // undo world coordinates compensation
        obj.parent?.worldToLocal(obj.position);
    }
    // rotate the OBJECT
    obj.rotateOnAxis(axis, theta);
}

/**
 * Get on-screen position of a given 3D position.
 *
 * @param position 3D position/coordinates
 * @param renderer Three.js renderer
 * @param camera Three.js camera
 * @returns
 */
function getOnScreenPosition(
    position: THREE.Vector3,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
): THREE.Vector2 {
    position.project(camera);
    const canvas = renderer.domElement;
    const widthHalf = canvas.clientWidth / 2;
    const heightHalf = canvas.clientHeight / 2;
    return new THREE.Vector2(
        position.x * widthHalf + widthHalf,
        -(position.y * heightHalf) + heightHalf,
    );
}

export { rotateAboutPoint, getOnScreenPosition };
