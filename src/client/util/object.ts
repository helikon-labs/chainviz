function cloneJSONSafeObject<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

export { cloneJSONSafeObject };
