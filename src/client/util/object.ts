/**
 * Clones an object.
 *
 * @param object input object
 * @returns clone
 */
function cloneJSONSafeObject<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Clones an array.
 *
 * @param array input array
 * @returns clone
 */
function cloneJSONSafeArray<T>(array: Array<T>): Array<T> {
    const clone = new Array<T>();
    for (const item of array) {
        clone.push(cloneJSONSafeObject(item));
    }
    return clone;
}

export { cloneJSONSafeObject, cloneJSONSafeArray };
