function cloneJSONSafeObject<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

function cloneJSONSafeArray<T>(array: Array<T>): Array<T> {
    const clone = new Array<T>();
    for (const item of array) {
        clone.push(cloneJSONSafeObject(item));
    }
    return clone;
}

export { cloneJSONSafeObject, cloneJSONSafeArray };
