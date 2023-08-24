import { ApiPromise, WsProvider } from '@polkadot/api';
import { Network, getNetworkPara } from '../model/substrate/network';
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from '../service/rpc/RPCSubscriptionService';
import { NetworkStatus, NetworkStatusUpdate } from '../model/subvt/network-status';
import { ValidatorListUpdate, ValidatorSummary } from '../model/subvt/validator-summary';
import { setAsyncTimeout } from '../util/async-util';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { ChainvizEvent } from '../event/event';
import { UnsubscribePromise } from '@polkadot/api/types';
import { Block } from '../model/chainviz/block';
import { BlockHash, Header } from '@polkadot/types/interfaces';
import { AnyJson } from '@polkadot/types/types';
import { XCMInfo, XCMInfoWrapper, isXCMInfo } from '../model/polkaholic/xcm';
import { Para } from '../model/substrate/para';
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from '../util/ui-util';
import AsyncLock from 'async-lock';

class DataStore {
    private network!: Network;
    private substrateClient!: ApiPromise;
    private networkStatusClient!: RPCSubscriptionService<NetworkStatusUpdate>;
    private activeValidatorListClient!: RPCSubscriptionService<ValidatorListUpdate>;
    private readonly eventBus = EventBus.getInstance();
    private newBlockSubscription?: UnsubscribePromise;
    private finalizedHeaderSubscription?: UnsubscribePromise;
    private xcmTransferGetTimeout?: NodeJS.Timeout;
    private readonly lock = new AsyncLock();
    private readonly blockProcessLockKey = 'block_process';

    private networkStatus!: NetworkStatus;
    validatorMap = new Map<string, ValidatorSummary>();
    blocks: Block[] = [];
    paras: Para[] = [];
    xcmTransfers: XCMInfo[] = [];

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
            this.disconnectNetworkStatusService();
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
                this.disconnectActiveValidatorListService();
                this.eventBus.dispatch<string>(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_ERROR);
            },
        };

    async setNetwork(network: Network) {
        this.network = network;
        await this.disconnectSubstrateClient();
        this.disconnectNetworkStatusService();
        this.disconnectActiveValidatorListService();
        if (this.xcmTransferGetTimeout) {
            clearTimeout(this.xcmTransferGetTimeout);
        }
        this.blocks = [];
        this.validatorMap.clear();
        this.paras = [];
        this.xcmTransfers = [];
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

    private disconnectNetworkStatusService() {
        this.networkStatusClient?.disconnect();
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

    private disconnectActiveValidatorListService() {
        this.activeValidatorListClient?.disconnect();
    }

    subscribeToActiveValidatorList() {
        this.activeValidatorListClient.subscribe();
    }

    private processNetworkStatusUpdate(update: NetworkStatusUpdate) {
        if (update.status) {
            this.networkStatus = update.status;
        } else if (update.diff) {
            Object.assign(this.networkStatus, update.diff);
        }
        this.eventBus.dispatch<NetworkStatus>(
            ChainvizEvent.NETWORK_STATUS_UPDATE,
            this.networkStatus,
        );
    }

    private processActiveValidatorListUpdate(update: ValidatorListUpdate) {
        if (this.validatorMap.size == 0) {
            this.eventBus.dispatch(ChainvizEvent.ACTIVE_VALIDATOR_LIST_INITIALIZED);
        }
        for (const validator of update.insert) {
            this.validatorMap.set(validator.address, validator);
        }
        for (const diff of update.update) {
            const validator = this.validatorMap.get(diff.accountId);
            if (validator) {
                Object.assign(validator, diff);
                this.validatorMap.set(validator.accountId, validator);
                continue;
            }
        }
        for (const removeAccountId of update.removeIds) {
            this.validatorMap.delete(removeAccountId);
        }
    }

    getParaById(paraId: number): Para | undefined {
        return this.paras.find((para) => para.paraId == paraId);
    }

    getParavalidatorStashAddresses(para: Para): string[] {
        const addresses: string[] = [];
        for (const validator of this.validatorMap.values()) {
            if (validator.paraId == para.paraId) {
                addresses.push(validator.address);
            }
        }
        return addresses;
    }

    async getInitialBlocks() {
        const finalizedBlocks: Block[] = [];
        // get finalized blocks
        const finalizedBlockHash = await this.substrateClient.rpc.chain.getFinalizedHead();
        let finalizedBlock = await this.getBlockByHash(finalizedBlockHash);
        if (finalizedBlock) {
            finalizedBlock.isFinalized = true;
            finalizedBlocks.push(finalizedBlock);
            for (let i = 0; i < Constants.INITIAL_BLOCK_COUNT; i++) {
                finalizedBlock = await this.getBlockByHash(finalizedBlock!.block.header.parentHash);
                if (finalizedBlock) {
                    finalizedBlock.isFinalized = true;
                    finalizedBlocks.push(finalizedBlock);
                } else {
                    return;
                }
            }
        } else {
            return;
        }
        // get non-finalized blocks
        const nonFinalizedBlocks: Block[] = [];
        let nonFinalizedHeader = await this.substrateClient.rpc.chain.getHeader();
        while (
            nonFinalizedHeader.number.toNumber() !=
            finalizedBlocks[0].block.header.number.toNumber()
        ) {
            const nonFinalizedBlock = await this.getBlockByHash(nonFinalizedHeader.hash);
            if (nonFinalizedBlock) {
                nonFinalizedBlocks.push(nonFinalizedBlock);
                nonFinalizedHeader = await this.substrateClient.rpc.chain.getHeader(
                    nonFinalizedHeader.parentHash,
                );
            } else {
                break;
            }
        }
        this.blocks = [...nonFinalizedBlocks, ...finalizedBlocks];
    }

    private async getParaIds(): Promise<number[]> {
        return (await this.substrateClient.query.paras.parachains()).toJSON() as number[];
    }

    async getParas() {
        this.paras = [];
        const paraIds = await this.getParaIds();
        for (const paraId of paraIds) {
            const para = getNetworkPara(this.network, paraId);
            if (para) {
                this.paras.push(para);
            }
        }
    }

    subscribeToNewBlocks() {
        if (this.newBlockSubscription) {
            return;
        }
        this.newBlockSubscription = this.substrateClient.rpc.chain.subscribeNewHeads(
            async (header) => {
                this.onNewBlock(header);
            },
        );
    }

    subscribeToFinalizedBlocks() {
        if (this.finalizedHeaderSubscription) {
            return;
        }
        this.finalizedHeaderSubscription = this.substrateClient.rpc.chain.subscribeFinalizedHeads(
            async (header) => {
                this.onFinalizedBlock(header);
            },
        );
    }

    private insertBlock(block: Block) {
        let insertIndex = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            insertIndex = i;
            if (
                block.block.header.number.toNumber() >=
                this.blocks[i].block.header.number.toNumber()
            ) {
                break;
            }
        }
        this.blocks = [
            ...this.blocks.slice(0, insertIndex),
            block,
            ...this.blocks.slice(insertIndex),
        ];
    }

    private async onNewBlock(header: Header) {
        this.lock.acquire(
            this.blockProcessLockKey,
            (done) => {
                this.processNewBlock(header, done);
            },
            (error, _) => {
                if (error) {
                    console.log('Error while processing new block:', error);
                }
                // lock released
            },
        );
    }

    private async processNewBlock(header: Header, done: AsyncLock.AsyncLockDoneCallback<unknown>) {
        if (
            this.blocks.findIndex((block) => block.block.header.toHex() == header.hash.toHex()) >= 0
        ) {
            return;
        }
        const block = await this.getBlockByHash(header.hash);
        if (block) {
            this.insertBlock(block);
            this.eventBus.dispatch<Block>(ChainvizEvent.NEW_BLOCK, block);
        }
        while (this.blocks.length > Constants.MAX_BLOCK_COUNT) {
            this.eventBus.dispatch<Block>(ChainvizEvent.DISCARDED_BLOCK, this.blocks.pop());
        }
        done();
    }

    private async onFinalizedBlock(header: Header) {
        this.lock.acquire(
            this.blockProcessLockKey,
            (done) => {
                this.processFinalizedBlock(header, done);
            },
            (error, _) => {
                if (error) {
                    console.log('Error while processing finalized block:', error);
                }
                // lock released
            },
        );
    }

    private async processFinalizedBlock(
        header: Header,
        done: AsyncLock.AsyncLockDoneCallback<unknown>,
    ) {
        // find unfinalized slots before this one & discard & finalize
        const removeIndices: number[] = [];
        for (let i = 0; i < this.blocks.length; i++) {
            if (
                header.number.toNumber() >= this.blocks[i].block.header.number.toNumber() &&
                header.hash != this.blocks[i].block.hash &&
                !this.blocks[i].isFinalized
            ) {
                removeIndices.push(i);
            }
        }
        for (const removeIndex of removeIndices.reverse()) {
            const removed = this.blocks.splice(removeIndex, 1);
            this.eventBus.dispatch<Block>(ChainvizEvent.DISCARDED_BLOCK, removed[0]);
        }

        let number = header.number.toNumber() - 1;
        while (
            this.blocks.findIndex((block) => block.block.header.number.toNumber() == number) < 0
        ) {
            const block = await this.getBlockByNumber(number);
            if (block) {
                block.isFinalized = true;
                this.insertBlock(block);
                this.eventBus.dispatch<Block>(ChainvizEvent.FINALIZED_BLOCK, block);
                number--;
            } else {
                break;
            }
        }

        const index = this.blocks.findIndex(
            (block) => block.block.header.hash.toHex() == header.hash.toHex(),
        );
        if (index >= 0) {
            this.blocks[index].isFinalized = true;
            this.eventBus.dispatch<Block>(ChainvizEvent.FINALIZED_BLOCK, this.blocks[index]);
        } else {
            const block = await this.getBlockByHash(header.hash);
            if (block) {
                block.isFinalized = true;
                this.insertBlock(block);
                this.eventBus.dispatch<Block>(ChainvizEvent.FINALIZED_BLOCK, block);
            }
        }
        done();
    }

    async getBlockByHash(hash: BlockHash): Promise<Block | undefined> {
        try {
            const extendedHeader = await this.substrateClient.derive.chain.getHeader(hash);
            const substrateBlock = (await this.substrateClient.rpc.chain.getBlock(hash)).block;
            const apiAt = await this.substrateClient.at(hash);
            const timestamp = (await apiAt.query.timestamp.now()).toJSON() as number;
            const events = (await apiAt.query.system.events()).toHuman() as AnyJson[];
            const runtimeVersion = await this.substrateClient.rpc.state.getRuntimeVersion(hash);
            const block = new Block(
                extendedHeader,
                substrateBlock,
                timestamp,
                events,
                runtimeVersion.specVersion.toNumber(),
            );
            const authorAccountId = block.extendedHeader.author;
            if (authorAccountId) {
                const validator = this.validatorMap.get(authorAccountId.toString());
                if (validator) {
                    block.setAuthorDisplay(getValidatorSummaryDisplay(validator));
                    block.setAuthorIdentityIconHTML(getValidatorIdentityIconHTML(validator));
                }
            }
            return block;
        } catch (_error) {
            return undefined;
        }
    }

    async getBlockByNumber(number: number): Promise<Block | undefined> {
        const hash = await this.substrateClient.rpc.chain.getBlockHash(number);
        return this.getBlockByHash(hash);
    }

    async getXCMTransfers() {
        const url = 'https://api.polkaholic.io/xcmtransfers';
        let xcmInfoWrapperList: XCMInfoWrapper[] = [];
        try {
            xcmInfoWrapperList = await (
                await fetch(
                    url +
                        '?' +
                        new URLSearchParams({
                            limit: `${Constants.XCM_TRANSFER_FETCH_LIMIT}`,
                        }).toString(),
                    {
                        method: 'GET',
                        headers: {},
                    },
                )
            ).json();
        } catch (error) {
            console.error('Error while fetching XCM transfers:', error);
        }
        const fetchedXCMTransfers: XCMInfo[] = [];
        for (const xcmInfoWrapper of xcmInfoWrapperList) {
            if (isXCMInfo(xcmInfoWrapper.xcmInfo)) {
                if (xcmInfoWrapper.xcmInfo.relayChain.relayChain == this.network.id) {
                    fetchedXCMTransfers.push(xcmInfoWrapper.xcmInfo);
                }
            }
        }
        fetchedXCMTransfers.sort((a, b) => b.origination.ts - a.origination.ts);
        const newXCMTransfers: XCMInfo[] = [];
        for (const fetchedXCMTransfer of fetchedXCMTransfers) {
            const index = this.xcmTransfers.findIndex(
                (existingXCMTransfer) =>
                    existingXCMTransfer.origination.extrinsicHash ==
                    fetchedXCMTransfer.origination.extrinsicHash,
            );
            if (index >= 0) {
                // message exists, skip
                continue;
            }
            console.log(
                fetchedXCMTransfer.origination.extrinsicHash,
                fetchedXCMTransfer.origination.amountSent,
                fetchedXCMTransfer.symbol ?? fetchedXCMTransfer.origination.txFeeSymbol,
            );
            newXCMTransfers.push(fetchedXCMTransfer);
        }
        this.xcmTransfers = [...newXCMTransfers, ...this.xcmTransfers];
        const excessCount = this.xcmTransfers.length - Constants.XCM_DISPLAY_LIMIT;
        if (excessCount > 0) {
            const discarded = this.xcmTransfers.splice(
                this.xcmTransfers.length - excessCount,
                excessCount,
            );
            this.eventBus.dispatch<XCMInfo[]>(ChainvizEvent.XCM_TRANSFERS_DISCARDED, discarded);
        }
        for (const xcmTransfer of this.xcmTransfers.reverse()) {
            this.eventBus.dispatch<XCMInfo>(ChainvizEvent.NEW_XCM_TRANSFER, xcmTransfer);
        }

        this.xcmTransferGetTimeout = setTimeout(() => {
            this.getXCMTransfers();
        }, Constants.XCM_TRANSFER_FETCH_PERIOD_MS);
    }

    async disconnectSubstrateClient() {
        if (this.newBlockSubscription) {
            (await this.newBlockSubscription)();
            this.newBlockSubscription = undefined;
        }
        if (this.finalizedHeaderSubscription) {
            (await this.finalizedHeaderSubscription)();
            this.finalizedHeaderSubscription = undefined;
        }
        if (this.substrateClient) {
            try {
                await this.substrateClient.disconnect();
            } catch (error) {
                console.error('Error while disconnecting Substrate client:', error);
            }
        }
    }

    getXCMTransferByOriginExtrinsicHash(hash: string): XCMInfo | undefined {
        return this.xcmTransfers.find(
            (xcmTransfer) => xcmTransfer.origination.extrinsicHash == hash,
        );
    }
}

export { DataStore };
