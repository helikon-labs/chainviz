import { describe, expect, test } from '@jest/globals';
import { DataStore } from '../src/client/data/data-store';
import { validators } from './data/validators';
import { Kusama } from '../src/client/model/substrate/network';
import { EventBus } from '../src/client/event/event-bus';
import { ChainvizEvent } from '../src/client/event/event';
import { ValidatorSummary } from '../src/client/model/subvt/validator-summary';
import { Constants } from '../src/client/util/constants';
import { Block } from '../src/client/model/chainviz/block';

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
        expect(dataStore['validatorMap'].size).toBe(validators.length);
    });
    test('active validator list insert works', () => {
        const dataStore = new DataStore();
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators.slice(0, 2),
            update: [],
            removeIds: [],
        });
        expect(dataStore['validatorMap'].size).toBe(2);
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators.slice(2, validators.length),
            update: [],
            removeIds: [],
        });
        expect(dataStore['validatorMap'].size).toBe(validators.length);
    });
    test('active validator list remove works and publishes event', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators,
            update: [],
            removeIds: [],
        });
        const removeIds = [validators[0].accountId, validators[1].accountId];
        const removeAddresses = [validators[0].address, validators[1].address];
        let eventReceived = false;
        const eventBus = EventBus.getInstance();
        eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_REMOVED,
            (removedStashAddresses: string[]) => {
                eventReceived =
                    removedStashAddresses.length == 2 &&
                    removedStashAddresses.every((value, index, _array) => {
                        return value == removeAddresses[index];
                    });
            },
        );
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: [],
            update: [],
            removeIds: removeIds,
        });
        expect(dataStore['validatorMap'].size).toBe(validators.length - removeIds.length);
        await new Promise((resolve) => setTimeout(resolve, 500));
        expect(eventReceived).toBeTruthy();
    });
    test('active validator list update works and publishes event', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators,
            update: [
                {
                    accountId: validators[0].accountId,
                    oversubscribed: true,
                },
            ],
            removeIds: [],
        });
        let eventReceived = false;
        const eventBus = EventBus.getInstance();
        eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_UPDATED,
            (updatedValidators: ValidatorSummary[]) => {
                eventReceived = updatedValidators.length == 2;
            },
        );
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: [],
            update: [
                {
                    accountId: validators[0].accountId,
                    oversubscribed: true,
                },
                {
                    accountId: validators[1].accountId,
                    blocksAuthored: 16,
                    paraId: 2010,
                },
            ],
            removeIds: [],
        });
        expect(dataStore['validatorMap'].get(validators[0].address)?.oversubscribed).toBeTruthy();
        expect(dataStore['validatorMap'].get(validators[1].address)?.blocksAuthored).toBe(16);
        expect(dataStore['validatorMap'].get(validators[1].address)?.paraId).toBe(2010);
        await new Promise((resolve) => setTimeout(resolve, 500));
        expect(eventReceived).toBeTruthy();
    });
    test('gets correct number of initial blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        await dataStore.getInitialBlocks();
        expect(dataStore['blocks'].length > Constants.INITIAL_FINALIZED_BLOCK_COUNT).toBeTruthy();
        expect(dataStore['blocks'].filter((block) => block.isFinalized).length).toBe(
            Constants.INITIAL_FINALIZED_BLOCK_COUNT,
        );
        await dataStore.disconnectSubstrateClient();
    });
    test('gets paras', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const paraIds = await dataStore['getParaIds']();
        await dataStore.getParas();
        expect(dataStore.paras.length).toBeGreaterThan(30);
        expect(dataStore.paras.length).toBeLessThanOrEqual(paraIds.length);
        await dataStore.disconnectSubstrateClient();
    });
    test('subscribes to new blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        let eventReceived = false;
        const eventBus = EventBus.getInstance();
        eventBus.register(ChainvizEvent.NEW_BLOCK, (block: Block) => {
            expect(block.events.length).toBeGreaterThan(0);
            eventReceived = true;
        });
        dataStore.subscribeToNewBlocks();
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        expect(eventReceived).toBeTruthy();
        await dataStore.disconnectSubstrateClient();
    });
    test('subscribes to finalized blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        let eventReceived = false;
        const eventBus = EventBus.getInstance();
        eventBus.register(ChainvizEvent.FINALIZED_BLOCK, (block: Block) => {
            expect(block.isFinalized).toBeTruthy();
            expect(block.events.length).toBeGreaterThan(0);
            eventReceived = true;
        });
        dataStore.subscribeToFinalizedBlocks();
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        expect(eventReceived).toBeTruthy();
        await dataStore.disconnectSubstrateClient();
    });
    test('can get block by hash', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const blockNumber = 19662640;
        const blockHash = await dataStore.getBlockHash(blockNumber);
        expect(blockHash).toBeDefined();
        expect(blockHash!.toHex()).toBe(
            '0x4c7b7509917a547a205adcc5a11fe86a8527707500b0d453b3fbc1d129109f35',
        );
        const block = await dataStore.getBlockByHash(blockHash!);
        expect(block).toBeDefined();
        expect(block!.block.header.number.toNumber()).toBe(blockNumber);
        expect(block!.events.length).toBe(48);
        await dataStore.disconnectSubstrateClient();
    });
    test('can get block by number', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const blockNumber = 19662639;
        const block = await dataStore.getBlockByNumber(blockNumber);
        expect(block).toBeDefined();
        expect(block!.block.header.number.toNumber()).toBe(blockNumber);
        expect(block!.events.length).toBe(44);
        await dataStore.disconnectSubstrateClient();
    });
    test('inserts blocks at correct indices', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const block10 = await dataStore.getBlockByNumber(10);
        dataStore['insertBlock'](block10!);
        const block30 = await dataStore.getBlockByNumber(30);
        dataStore['insertBlock'](block30!);
        const block20 = await dataStore.getBlockByNumber(20);
        dataStore['insertBlock'](block20!);
        const block15 = await dataStore.getBlockByNumber(15);
        dataStore['insertBlock'](block15!);
        expect(dataStore['blocks'][0].block.header.number.toNumber()).toBe(30);
        expect(dataStore['blocks'][1].block.header.number.toNumber()).toBe(20);
        expect(dataStore['blocks'][2].block.header.number.toNumber()).toBe(15);
        expect(dataStore['blocks'][3].block.header.number.toNumber()).toBe(10);
    });
    test('discards older blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const initialBlockNumber = 10;
        const excessBlockCount = 5;
        for (let i = 0; i < Constants.MAX_BLOCK_COUNT + 5; i++) {
            const block = await dataStore.getBlockByNumber(initialBlockNumber + i);
            dataStore['insertBlock'](block!);
        }
        for (let i = 0; i < excessBlockCount; i++) {
            const block = await dataStore.getBlockByNumber(10 + Constants.MAX_BLOCK_COUNT + i);
            dataStore['processNewBlock'](block!.block.header);
        }
        expect(dataStore['blocks'].length).toBe(Constants.MAX_BLOCK_COUNT);
    });
    test('gets missing finalized blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const eventBus = EventBus.getInstance();
        let finalizedBlockEventCount = 0;
        eventBus.register(ChainvizEvent.FINALIZED_BLOCK, (_block: Block) => {
            finalizedBlockEventCount++;
        });
        const initialBlockNumber = 10;
        const firstBlock = await dataStore.getBlockByNumber(initialBlockNumber);
        firstBlock!.isFinalized = true;
        dataStore['insertBlock'](firstBlock!);
        const lastBlock = await dataStore.getBlockByNumber(initialBlockNumber + 5);
        await dataStore['processFinalizedBlock'](lastBlock!.block.header);
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        expect(finalizedBlockEventCount).toBe(5);
    });
    test('removes unfinalized blocks and replaces with finalized blocks', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const eventBus = EventBus.getInstance();
        let discardedBlockEventCount = 0;
        eventBus.register(ChainvizEvent.DISCARDED_BLOCK, (_block: Block) => {
            discardedBlockEventCount++;
        });
        let finalizedBlockEventCount = 0;
        eventBus.register(ChainvizEvent.FINALIZED_BLOCK, (_block: Block) => {
            finalizedBlockEventCount++;
        });
        const block10 = await dataStore.getBlockByNumber(10);
        block10!.isFinalized = true;
        dataStore['insertBlock'](block10!);
        const block11 = await dataStore.getBlockByNumber(11);
        dataStore['insertBlock'](block11!);
        const block12 = await dataStore.getBlockByNumber(12);
        dataStore['insertBlock'](block12!);
        const block13 = await dataStore.getBlockByNumber(13);
        await dataStore['processFinalizedBlock'](block13!.block.header);
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        expect(discardedBlockEventCount).toBe(2);
        expect(finalizedBlockEventCount).toBe(3);
    });
    test('only removes unfinalized blocks if no finalized blocks prior', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.connectSubstrateRPC();
        const eventBus = EventBus.getInstance();
        let discardedBlockEventCount = 0;
        eventBus.register(ChainvizEvent.DISCARDED_BLOCK, (_block: Block) => {
            discardedBlockEventCount++;
        });
        let finalizedBlockEventCount = 0;
        eventBus.register(ChainvizEvent.FINALIZED_BLOCK, (_block: Block) => {
            finalizedBlockEventCount++;
        });
        const block10 = await dataStore.getBlockByNumber(10);
        dataStore['insertBlock'](block10!);
        const block11 = await dataStore.getBlockByNumber(11);
        dataStore['insertBlock'](block11!);
        const block12 = await dataStore.getBlockByNumber(12);
        dataStore['insertBlock'](block12!);
        const block13 = await dataStore.getBlockByNumber(13);
        await dataStore['processFinalizedBlock'](block13!.block.header);
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        expect(discardedBlockEventCount).toBe(3);
        expect(finalizedBlockEventCount).toBe(1);
    });
    test('can get XCM transfers', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.getXCMTransfers();
        expect(dataStore.xcmTransfers.length).toBeGreaterThan(0);
        expect(dataStore.xcmTransfers.length).toBeLessThanOrEqual(Constants.XCM_DISPLAY_LIMIT);
        for (const xcmTransfer of dataStore.xcmTransfers) {
            expect(xcmTransfer.relayChain.relayChain).toBe(Kusama.id);
            expect(xcmTransfer.origination).toBeDefined();
            expect(xcmTransfer.destination).toBeDefined();
        }
        clearTimeout(dataStore['xcmTransferGetTimeout']);
    });
    test('can get XCM transfer by origin hash', async () => {
        const dataStore = new DataStore();
        await dataStore.setNetwork(Kusama);
        await dataStore.getXCMTransfers();
        const xcmTransfer = dataStore.getXCMTransferByOriginExtrinsicHash(
            dataStore.xcmTransfers[0].origination.extrinsicHash,
        );
        expect(xcmTransfer).toBeDefined();
        clearTimeout(dataStore['xcmTransferGetTimeout']);
    });
});
