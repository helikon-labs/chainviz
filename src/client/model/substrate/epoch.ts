/**
 * Substrate epoch.
 */
interface Epoch {
    index: number;
    startBlockNumber: number;
    startTimestamp: number;
    endTimestamp: number;
}

export { Epoch };
