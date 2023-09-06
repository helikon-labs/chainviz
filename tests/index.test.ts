import { describe, expect, test } from '@jest/globals';
import { BlockList } from '../src/client/ui/block-list';
import { JSDOM } from 'jsdom';

describe('sum module', () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(3).toBe(3);
    });
});

describe('block list', () => {
    test('does init', async () => {
        const dom = await JSDOM.fromFile(`${__dirname}/../dist/client/index.html`);
        global.document = dom.window._document;
        const blockList = new BlockList('dummy', false);
        expect(blockList).not.toBeUndefined();
    });
});
