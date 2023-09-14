import { describe, expect, test, jest } from '@jest/globals';
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from '../src/client/service/rpc/rpc-subscription-service';
import { NetworkStatusUpdate } from '../src/client/model/subvt/network-status';
import { Kusama } from '../src/client/model/substrate/network';
import { ValidatorListUpdate } from '../src/client/model/subvt/validator-summary';

describe('rpc subscription service', () => {
    test('network status service subscription works', async () => {
        const onSubscribed = jest.fn((_subscriptionId: number) => {});
        const onUnsubscribed = jest.fn((_subscriptionId: number) => {});
        const onDisconnected = jest.fn();
        const onUpdate = jest.fn((update: NetworkStatusUpdate) => {
            expect(update.diff != undefined || update.status != undefined).toBeTruthy();
        });
        const onError = jest.fn((_code: number, _message: string) => {});
        const networkStatusListener: RPCSubscriptionServiceListener<NetworkStatusUpdate> = {
            onConnected: () => {
                networkStatusClient.subscribe();
            },
            onSubscribed,
            onUnsubscribed,
            onDisconnected,
            onUpdate,
            onError,
        };
        const networkStatusClient = new RPCSubscriptionService(
            Kusama.networkStatusServiceURL,
            'subscribe_networkStatus',
            'unsubscribe_networkStatus',
            networkStatusListener,
        );
        networkStatusClient.connect();
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        networkStatusClient.unsubscribe();
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        networkStatusClient.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        expect(onSubscribed).toBeCalled();
        expect(onUpdate).toBeCalled();
        expect(onUnsubscribed).toBeCalled();
        expect(onDisconnected).toBeCalled();
        expect(onError).not.toBeCalled();
    });
    test('active validator list service subscription works', async () => {
        const onSubscribed = jest.fn((_subscriptionId: number) => {});
        const onUnsubscribed = jest.fn((_subscriptionId: number) => {});
        const onDisconnected = jest.fn();
        const onUpdate = jest.fn((_update: ValidatorListUpdate) => {});
        const onError = jest.fn((_code: number, _message: string) => {});
        const activeValidatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> = {
            onConnected: () => {
                activeValidatorListClient.subscribe();
            },
            onSubscribed,
            onUnsubscribed,
            onDisconnected,
            onUpdate,
            onError,
        };
        const activeValidatorListClient = new RPCSubscriptionService(
            Kusama.activeValidatorListServiceURL,
            'subscribe_validatorList',
            'unsubscribe_validatorList',
            activeValidatorListListener,
        );
        activeValidatorListClient.connect();
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        activeValidatorListClient.unsubscribe();
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        activeValidatorListClient.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        expect(onSubscribed).toBeCalled();
        expect(onUpdate).toBeCalled();
        expect(onUnsubscribed).toBeCalled();
        expect(onDisconnected).toBeCalled();
        expect(onError).not.toBeCalled();
    });
});
