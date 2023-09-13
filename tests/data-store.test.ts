import { describe, expect, test } from '@jest/globals';
import { DataStore } from '../src/client/data/data-store';
import { validators } from './data/validators';
import { Kusama } from '../src/client/model/substrate/network';
import { EventBus } from '../src/client/event/event-bus';
import { ChainvizEvent } from '../src/client/event/event';
import { ValidatorSummary } from '../src/client/model/subvt/validator-summary';

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
        dataStore.setNetwork(Kusama);
        dataStore['processActiveValidatorListUpdate']({
            finalizedBlockNumber: 0,
            insert: validators,
            update: [],
            removeIds: [],
        });
        const removeIds = [validators[0].accountId, validators[1].accountId];
        const removeAddresses = [validators[0].address, validators[1].address];
        const eventBus = EventBus.getInstance();
        let eventReceived = false;
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
        dataStore.setNetwork(Kusama);
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
        const eventBus = EventBus.getInstance();
        let eventReceived = false;
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
});
