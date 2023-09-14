import { Kusama } from '../src/client/model/substrate/network';
import { formatNumber } from '../src/client/util/format';
import { describe, expect, test } from '@jest/globals';

describe('format', () => {
    test('number formatting works with ticker', async () => {
        const formatted = formatNumber(123456789n, 5, 2, Kusama.tokenTicker);
        expect(formatted).toBe('1,234.56 KSM');
    });
    test('number formatting works without ticker', async () => {
        const formatted = formatNumber(123456789n, 5, 2);
        expect(formatted).toBe('1,234.56');
    });
    test('number formatting works with no format decimals', async () => {
        const formatted = formatNumber(123456789n, 5, 0);
        expect(formatted).toBe('1,234');
    });
});
