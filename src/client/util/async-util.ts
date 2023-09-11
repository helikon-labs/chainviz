/**
 * Utilized to apply timeout to the Substrate RPC connection.
 *
 * @param callback callback
 * @param timeout timeout in ms
 * @returns promise
 */
const setAsyncTimeout = (callback: (value: (value: unknown) => void) => void, timeout = 0) =>
    new Promise((resolve, reject) => {
        callback(resolve);
        setTimeout(() => reject('Request is taking too long to response'), timeout);
    });

export { setAsyncTimeout };
