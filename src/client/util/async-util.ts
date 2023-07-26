const setAsyncTimeout = (cb: (value: (value: unknown) => void) => void, timeout = 0) =>
    new Promise((resolve, reject) => {
        cb(resolve);
        setTimeout(() => reject('Request is taking too long to response'), timeout);
    });

export { setAsyncTimeout };
