import { describe, expect, test } from '@jest/globals';
import { DataStore } from '../src/client/data/data-store';
import { validators } from './data/validators';

// prettier-ignore
(BigInt.prototype as any).toJSON = function () { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.toString();
};

describe('data store', () => {
    test('active validator list initialize works', () => {
        const dataStore = new DataStore();
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators,
            update: [],
            removeIds: [],
        });
        expect(dataStore['validatorMap'].size).toBe(5);
    });
    test('active validator list remove works', () => {
        const dataStore = new DataStore();
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators,
            update: [],
            removeIds: [],
        });
    });
});
