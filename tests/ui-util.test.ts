import { describe, expect, test } from '@jest/globals';
import { validators } from './data/validators';
import { getValidatorSummaryDisplay } from '../src/client/util/ui-util';

describe('ui util', () => {
    test('generates correct validator summary display with identity', async () => {
        const expectedDisplay = '🏔 HELIKON 🏔 /  ISTANBUL';
        expect(getValidatorSummaryDisplay(validators[0])).toEqual(expectedDisplay);
    });
    test('generates correct validator summary display without identity', async () => {
        const expectedDisplay = 'HTauJM...DG6ef2';
        expect(getValidatorSummaryDisplay(validators[4])).toEqual(expectedDisplay);
    });
});
