import { describe, expect, test } from '@jest/globals';
import { cloneJSONSafeObject } from '../src/client/util/object';
import { validators } from './data/validators';

// prettier-ignore
(BigInt.prototype as any).toJSON = function () { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.toString();
};

describe('object', () => {
    test('clone object works', async () => {
        const cloneValidator1 = cloneJSONSafeObject(validators[0]);
        expect(JSON.stringify(cloneValidator1)).toEqual(JSON.stringify(validators[0]));
    });
    test('clone array works', async () => {
        const cloneValidators = cloneJSONSafeObject(validators);
        expect(JSON.stringify(cloneValidators)).toEqual(JSON.stringify(validators));
    });
});
