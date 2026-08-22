import { describe, expect, test } from '@jest/globals';
import {
    buildCoreAssignmentState,
    getGroupIndexForCore,
    getParaId,
} from '../src/client/data/core-assignment';

describe('core assignments', () => {
    test('reads current runtime and legacy storage claim shapes', () => {
        expect(getParaId(1000)).toBe(1000);
        expect(getParaId('2000')).toBe(2000);
        expect(getParaId({ bulk: 3000 })).toBe(3000);
        expect(getParaId({ task: 4000 })).toBe(4000);
        expect(getParaId(undefined)).toBeUndefined();
    });

    test('applies validator group rotation', () => {
        const rotationInfo = {
            sessionStartBlock: 100,
            groupRotationFrequency: 10,
            now: 120,
        };
        expect(getGroupIndexForCore(0, 4, rotationInfo)).toBe(2);
        expect(getGroupIndexForCore(3, 4, rotationInfo)).toBe(1);
    });

    test('preserves sparse core indices and combines elastic scaling groups', () => {
        const state = buildCoreAssignmentState(
            {
                0: [1000],
                2: [{ bulk: 2000 }],
                3: [{ task: 1000 }],
            },
            [['validator-0'], ['validator-1'], ['validator-2'], ['validator-3']],
            {
                sessionStartBlock: 100,
                groupRotationFrequency: 10,
                now: 120,
            },
        );

        expect(state.cores).toEqual([1000, undefined, 2000, 1000]);
        expect(state.validatorsByCore).toEqual([
            ['validator-2'],
            ['validator-3'],
            ['validator-0'],
            ['validator-1'],
        ]);
        expect(state.assignments.get(1000)).toEqual(['validator-2', 'validator-1']);
        expect(state.assignments.get(2000)).toEqual(['validator-0']);
    });
});
