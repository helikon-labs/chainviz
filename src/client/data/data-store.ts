import { ApiPromise, WsProvider } from '@polkadot/api';
import { Network } from '../model/substrate/network';
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from '../service/rpc/RPCSubscriptionService';
import { NetworkStatusUpdate } from '../model/subvt/network-status';
import { ValidatorListUpdate } from '../model/subvt/validator-summary';
import { setAsyncTimeout } from '../util/async-util';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { ChainvizEvent } from '../event/event';
import { Block } from '@polkadot/types/interfaces';
import { UnsubscribePromise } from '@polkadot/api/types';
import { Slot } from '../model/chainviz/slot';

class DataStore {
    private network!: Network;
    private substrateClient!: ApiPromise;
    private networkStatusClient!: RPCSubscriptionService<NetworkStatusUpdate>;
    private activeValidatorListClient!: RPCSubscriptionService<ValidatorListUpdate>;
    private readonly eventBus = EventBus.getInstance();
    private newBlockSubscription?: UnsubscribePromise;
    private finalizedHeaderSubscription?: UnsubscribePromise;

    private readonly networkStatusListener: RPCSubscriptionServiceListener<NetworkStatusUpdate> = {
        onConnected: () => {
            this.eventBus.dispatch<string>(ChainvizEvent.NETWORK_STATUS_SERVICE_CONNECTED);
        },
        onSubscribed: (_subscriptionId: number) => {
            this.eventBus.dispatch<string>(ChainvizEvent.NETWORK_STATUS_SERVICE_SUBSCRIBED);
        },
        onUnsubscribed: (_subscriptionId: number) => {
            this.eventBus.dispatch<string>(ChainvizEvent.NETWORK_STATUS_SERVICE_UNSUBSCRIBED);
        },
        onDisconnected: () => {
            this.eventBus.dispatch<string>(ChainvizEvent.NETWORK_STATUS_SERVICE_DISCONNECTED);
        },
        onUpdate: (update: NetworkStatusUpdate) => {
            this.processNetworkStatusUpdate(update);
        },
        onError: (code: number, message: string) => {
            console.log(`Network status service error (${code}: ${message}).`);
            this.eventBus.dispatch<string>(ChainvizEvent.NETWORK_STATUS_SERVICE_ERROR);
        },
    };

    private readonly activeValidatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> =
        {
            onConnected: () => {
                this.eventBus.dispatch<string>(
                    ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_CONNECTED,
                );
            },
            onSubscribed: (_subscriptionId: number) => {
                this.eventBus.dispatch<string>(
                    ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_SUBSCRIBED,
                );
            },
            onUnsubscribed: (_subscriptionId: number) => {
                this.eventBus.dispatch<string>(
                    ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_UNSUBSCRIBED,
                );
            },
            onDisconnected: () => {
                this.eventBus.dispatch<string>(
                    ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_DISCONNECTED,
                );
            },
            onUpdate: (update: ValidatorListUpdate) => {
                this.processActiveValidatorListUpdate(update);
            },
            onError: (code: number, message: string) => {
                console.log(`Validator list service error (${code}: ${message}).`);
                this.eventBus.dispatch<string>(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_ERROR);
            },
        };

    setNetwork(network: Network) {
        this.network = network;
    }

    async connectSubstrateRPC() {
        this.substrateClient = new ApiPromise({
            provider: new WsProvider(this.network.rpcURL),
        });
        try {
            await setAsyncTimeout(async (done) => {
                await this.substrateClient.isReady;
                done(0);
            }, Constants.CONNECTION_TIMEOUT_MS);
            this.eventBus.dispatch<string>(ChainvizEvent.SUBSTRATE_API_READY);
        } catch (error) {
            this.eventBus.dispatch<string>(ChainvizEvent.SUBSTRATE_API_CONNECTION_TIMED_OUT);
        }
    }

    connectNetworkStatusService() {
        this.networkStatusClient = new RPCSubscriptionService(
            this.network.networkStatusServiceURL,
            'subscribe_networkStatus',
            'unsubscribe_networkStatus',
            this.networkStatusListener,
        );
        this.networkStatusClient.connect();
    }

    disconnectNetworkStatusService() {
        this.networkStatusClient.disconnect();
    }

    subscribeToNetworkStatus() {
        this.networkStatusClient.subscribe();
    }

    connectActiveValidatorListService() {
        this.activeValidatorListClient = new RPCSubscriptionService(
            this.network.activeValidatorListServiceURL,
            'subscribe_validatorList',
            'unsubscribe_validatorList',
            this.activeValidatorListListener,
        );
        this.activeValidatorListClient.connect();
    }

    disconnectActiveValidatorListService() {
        this.activeValidatorListClient.disconnect();
    }

    subscribeToActiveValidatorList() {
        this.activeValidatorListClient.subscribe();
    }

    processNetworkStatusUpdate(update: NetworkStatusUpdate) {
        this.eventBus.dispatch<NetworkStatusUpdate>(ChainvizEvent.NETWORK_STATUS_UPDATE, update);
    }

    processActiveValidatorListUpdate(update: ValidatorListUpdate) {
        this.eventBus.dispatch<ValidatorListUpdate>(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_UPDATE,
            update,
        );
    }

    async getInitialSlots(): Promise<Slot[]> {
        const finalizedSlots: Slot[] = [];
        // get finalized blocks
        const finalizedBlockHash = await this.substrateClient.rpc.chain.getFinalizedHead();
        const lastFinalizedBlock = (
            await this.substrateClient.rpc.chain.getBlock(finalizedBlockHash)
        ).block;
        finalizedSlots.push(
            new Slot(lastFinalizedBlock.header.number.toNumber(), true, [lastFinalizedBlock]),
        );
        let finalizedBlock = lastFinalizedBlock;
        for (let i = Constants.INITIAL_SLOT_COUNT - 1; i > 0; i--) {
            finalizedBlock = (
                await this.substrateClient.rpc.chain.getBlock(finalizedBlock.header.parentHash)
            ).block;
            finalizedSlots.push(
                new Slot(finalizedBlock.header.number.toNumber(), true, [finalizedBlock]),
            );
        }
        // get non-finalized blocks
        const nonFinalizedSlots: Slot[] = [];
        const lastHeader = await this.substrateClient.rpc.chain.getHeader();
        let nonFinalizedBlock = (await this.substrateClient.rpc.chain.getBlock(lastHeader.hash))
            .block;
        while (nonFinalizedBlock.header.hash.toHex() != lastFinalizedBlock.header.hash.toHex()) {
            nonFinalizedSlots.push(
                new Slot(nonFinalizedBlock.header.number.toNumber(), false, [nonFinalizedBlock]),
            );
            nonFinalizedBlock = (
                await this.substrateClient.rpc.chain.getBlock(nonFinalizedBlock.header.parentHash)
            ).block;
        }
        return [...nonFinalizedSlots, ...finalizedSlots];
    }

    async getParaIds(): Promise<number[]> {
        return (await this.substrateClient.query.paras.parachains()).toHuman() as number[];
    }

    subsribeToNewBlocks() {
        if (this.newBlockSubscription) {
            return;
        }
        this.newBlockSubscription = this.substrateClient.rpc.chain.subscribeNewHeads(
            async (header) => {
                const block = (await this.substrateClient.rpc.chain.getBlock(header.hash)).block;
                this.eventBus.dispatch<Block>(ChainvizEvent.NEW_BLOCK, block);
            },
        );
    }

    subsribeToFinalizedBlocks() {
        if (this.finalizedHeaderSubscription) {
            return;
        }
        this.finalizedHeaderSubscription = this.substrateClient.rpc.chain.subscribeFinalizedHeads(
            async (header) => {
                const block = (await this.substrateClient.rpc.chain.getBlock(header.hash)).block;
                this.eventBus.dispatch<Block>(ChainvizEvent.NEW_FINALIZED_BLOCK, block);
            },
        );
    }

    async getBlockByNumber(number: number): Promise<Block> {
        const hash = await this.substrateClient.rpc.chain.getBlockHash(number);
        const block = (await this.substrateClient.rpc.chain.getBlock(hash)).block;
        return block;
    }
}

export { DataStore };
