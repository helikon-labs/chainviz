import { ApiPromise, WsProvider } from '@polkadot/api';
import { Network, getNetworkPara } from '../model/substrate/network';
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from '../service/rpc/rpc-subscription-service';
import { NetworkStatus, NetworkStatusUpdate } from '../model/subvt/network-status';
import { ValidatorListUpdate, ValidatorSummary } from '../model/subvt/validator-summary';
import { setAsyncTimeout } from '../util/async-util';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { ChainvizEvent } from '../event/event';
import { UnsubscribePromise } from '@polkadot/api/types';
import { Block } from '../model/chainviz/block';
import { BlockHash, Header } from '@polkadot/types/interfaces';
import { AnyJson, Codec } from '@polkadot/types/types';
import { XCMInfo, XCMInfoWrapper, isXCMInfo } from '../model/polkaholic/xcm';
import { Para } from '../model/substrate/para';
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from '../util/ui-util';
import AsyncLock from 'async-lock';
import { cloneJSONSafeObject } from '../util/object';
import { getSS58Address } from '../util/crypto-util';

/**
 * Stores data and contains data-related logic.
 *   - Substrate RPC connection.
 *   - SubVT services - network status and active validator list.
 *   - XCM transfers.
 */
class DataStore {
    private network!: Network;
    private substrateClient?: ApiPromise;
    private networkStatusClient!: RPCSubscriptionService<NetworkStatusUpdate>;
    private activeValidatorListClient!: RPCSubscriptionService<ValidatorListUpdate>;
    private readonly eventBus = EventBus.getInstance();
    private unsubscribeNewBlock?: UnsubscribePromise;
    private unsubscribeFinalizedHeader?: UnsubscribePromise;
    private xcmTransferGetTimeout?: NodeJS.Timeout;
    private readonly lock = new AsyncLock();
    private readonly blockProcessLockKey = 'block_process';

    private readonly paravalidatorLock = new AsyncLock();
    private readonly paravalidatorProcessLockKey = 'paravalidator';
    private validators: string[] = [];
    private unsubscribeValidators?: Promise<Codec>;
    private paravalidators: string[] = [];
    private unsubscribeParavalidators?: Promise<Codec>;
    private paravalidatorGroups: string[][] = [];
    private unsubscribeParavalidatorGroups?: Promise<Codec>;
    private cores: (number | undefined)[] = [];
    private unsubscribeCores?: Promise<Codec>;

    private networkStatus!: NetworkStatus;
    validatorMap = new Map<string, ValidatorSummary>();
    blocks: Block[] = [];
    paras: Para[] = [];
    xcmTransfers: XCMInfo[] = [];

    /**
     * Receives network status and updates from the SubVT network status server.
     */
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

    /**
     * Receives the active validator list and updates from the SubVT active validator list server.
     */
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
                console.error(`Validator list service error (${code}: ${message}).`);
                this.disconnectActiveValidatorListService();
                this.eventBus.dispatch<string>(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_ERROR);
            },
        };

    /**
     * Changes the selected network. Disconnects Substrate RPC and SubVT service connections,
     * and resets data.
     *
     * @param network selected network (Kusama or Polkadot)
     */
    async setNetwork(network: Network) {
        this.network = network;
        // disconnect services
        await this.disconnectSubstrateClient();
        this.disconnectNetworkStatusService();
        this.disconnectActiveValidatorListService();
        if (this.xcmTransferGetTimeout) {
            clearTimeout(this.xcmTransferGetTimeout);
        }
        // reset data
        this.blocks = [];
        this.validatorMap.clear();
        this.paras = [];
        this.xcmTransfers = [];
    }

    /**
     * Establishes the Substrate WS-RPC connection.
     */
    async connectSubstrateRPC() {
        try {
            // connection timeout handling
            await setAsyncTimeout((done) => {
                (async () => {
                    this.substrateClient = await ApiPromise.create({
                        provider: new WsProvider(this.network.rpcURL),
                    });
                    done(0);
                })();
            }, Constants.CONNECTION_TIMEOUT_MS);
            this.eventBus.dispatch<string>(ChainvizEvent.SUBSTRATE_API_READY);
        } catch (_error) {
            this.eventBus.dispatch<string>(ChainvizEvent.SUBSTRATE_API_CONNECTION_TIMED_OUT);
        }
    }

    /**
     * Establishes the SubVT network status WS service connection.
     */
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

    /**
     * Subscribes to network status updates.
     */
    subscribeToNetworkStatus() {
        this.networkStatusClient.subscribe();
    }

    /**
     * Establishes the SubVT active validator list WS service connection.
     */
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

    /**
     * Subscribes to active validator list updates.
     */
    subscribeToActiveValidatorList() {
        this.activeValidatorListClient.subscribe();
    }

    /**
     * Processes the network status update sent from the SubVT service.
     */
    private processNetworkStatusUpdate(update: NetworkStatusUpdate) {
        if (update.status) {
            // receiving the network status for the first time
            this.networkStatus = update.status;
        } else if (update.diff) {
            // received a diff - apply it
            Object.assign(this.networkStatus, update.diff);
        }
        // dispatch the update
        this.eventBus.dispatch<NetworkStatus>(
            ChainvizEvent.NETWORK_STATUS_UPDATE,
            this.networkStatus,
        );
    }

    /**
     * Processes the active validator list update sent from the SubVT service.
     */
    private processActiveValidatorListUpdate(update: ValidatorListUpdate) {
        const removedStashAddresses: string[] = [];
        // remove first
        for (const removeAccountId of update.removeIds) {
            const address = getSS58Address(this.network.ss58Prefix, removeAccountId);
            this.validatorMap.delete(address);
            removedStashAddresses.push(address);
        }
        if (removedStashAddresses.length > 0) {
            this.eventBus.dispatch(
                ChainvizEvent.ACTIVE_VALIDATOR_LIST_REMOVED,
                removedStashAddresses,
            );
        }
        // add new validators
        if (update.insert.length > 0) {
            // check whether we're receiving the first update
            const isInit = this.validatorMap.size == 0;
            for (const validator of update.insert) {
                this.validatorMap.set(validator.address, cloneJSONSafeObject(validator));
            }
            if (isInit) {
                this.eventBus.dispatch(ChainvizEvent.ACTIVE_VALIDATOR_LIST_INITIALIZED);
            } else {
                this.eventBus.dispatch(ChainvizEvent.ACTIVE_VALIDATOR_LIST_ADDED, update.insert);
            }
        }
        // apply updates to the existing validators
        const updatedValidators: ValidatorSummary[] = [];
        for (const diff of update.update) {
            const address = getSS58Address(this.network.ss58Prefix, diff.accountId);
            const validator = this.validatorMap.get(address);
            if (validator != undefined) {
                Object.assign(validator, diff);
                this.validatorMap.set(address, validator);
                updatedValidators.push(cloneJSONSafeObject(validator));
            }
        }
        if (updatedValidators.length > 0) {
            this.eventBus.dispatch(ChainvizEvent.ACTIVE_VALIDATOR_LIST_UPDATED, updatedValidators);
        }
    }

    getParaById(paraId: number): Para | undefined {
        return this.paras.find((para) => para.paraId == paraId);
    }

    /**
     * Gets the stash addresses of paravalidators for a given parachain/thread.
     *
     * @param para parachain/thread
     * @returns paravalidator stash addresses in an array
     */
    getParavalidatorStashAddresses(para: Para, callback: (stashAdresses: string[]) => void) {
        this.paravalidatorLock.acquire(
            this.paravalidatorProcessLockKey,
            (done) => {
                let paravalidators: string[] = [];
                for (let i = 0; i < this.cores.length; i++) {
                    if (this.cores[i] == para.paraId) {
                        paravalidators = this.paravalidatorGroups[i];
                        break;
                    }
                }
                callback(paravalidators);
                done();
            },
            (error, _) => {
                if (error) {
                    console.log('Error while processing subscribed paravalidator list:', error);
                }
                // lock released
            },
        );
    }

    async getValidatorParaId(address: string, callback: (paraId: number | undefined) => void) {
        this.paravalidatorLock.acquire(
            this.paravalidatorProcessLockKey,
            (done) => {
                let paraId: number | undefined = undefined;
                for (let i = 0; i < this.paravalidatorGroups.length; i++) {
                    if (this.paravalidatorGroups[i].indexOf(address) >= 0) {
                        paraId = this.cores[i];
                    }
                }
                callback(paraId);
                done();
            },
            (error, _) => {
                if (error) {
                    console.log('Error while processing subscribed paravalidator list:', error);
                }
                // lock released
            },
        );
    }

    async subscribeToValidators() {
        if (!this.substrateClient) {
            return;
        }
        // @ts-expect-error untyped
        this.unsubscribeValidators = this.substrateClient.query.session.validators((data) => {
            this.paravalidatorLock.acquire(
                this.paravalidatorProcessLockKey,
                (done) => {
                    this.validators = data.toJSON() as string[];
                    done();
                },
                (error, _) => {
                    if (error) {
                        console.log('Error while processing subscribed validator list:', error);
                    }
                    // lock released
                },
            );
        });
    }

    async subscribeToParavalidators() {
        if (!this.substrateClient) {
            return;
        }
        this.unsubscribeParavalidators =
            // @ts-expect-error untyped
            this.substrateClient.query.parasShared.activeValidatorIndices((data) => {
                const paravalidatorIndices = data.toJSON() as number[];
                this.paravalidatorLock.acquire(
                    this.paravalidatorProcessLockKey,
                    (done) => {
                        this.paravalidators = paravalidatorIndices.map((i) => this.validators[i]);
                        done();
                    },
                    (error, _) => {
                        if (error) {
                            console.log(
                                'Error while processing subscribed paravalidator list:',
                                error,
                            );
                        }
                        // lock released
                    },
                );
            });
    }

    async subscribeToParavalidatorGroups() {
        if (!this.substrateClient) {
            return;
        }
        this.unsubscribeParavalidatorGroups =
            // @ts-expect-error untyped
            this.substrateClient.query.paraScheduler.validatorGroups((data) => {
                const groups = data.toJSON() as number[][];
                this.paravalidatorLock.acquire(
                    this.paravalidatorProcessLockKey,
                    (done) => {
                        this.paravalidatorGroups = groups.map((i) =>
                            i.map((j) => this.paravalidators[j]),
                        );
                        done();
                    },
                    (error, _) => {
                        if (error) {
                            console.log(
                                'Error while processing subscribed paravalidator groups:',
                                error,
                            );
                        }
                        // lock released
                    },
                );
            });
    }

    async subscribeToCoresLegacy() {
        if (!this.substrateClient) {
            return;
        }
        this.unsubscribeCores = this.substrateClient.query.paraScheduler.availabilityCores(
            // @ts-expect-error untyped
            (data) => {
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const cores = data.toJSON() as any[];
                this.paravalidatorLock.acquire(
                    this.paravalidatorProcessLockKey,
                    (done) => {
                        const assignments = new Map<number, string[]>();
                        this.cores = [];
                        for (let i = 0; i < cores.length; i++) {
                            const core = cores[i];
                            if (core.paras?.assignment?.bulk) {
                                const paraId = core.paras.assignment.bulk as number;
                                this.cores.push(paraId);
                                assignments.set(paraId, this.paravalidatorGroups[i]);
                            } else {
                                this.cores.push(undefined);
                            }
                        }
                        this.eventBus.dispatch<Map<number, string[]>>(
                            ChainvizEvent.CORES_UPDATED,
                            assignments,
                        );
                        done();
                    },
                    (error, _) => {
                        if (error) {
                            console.log(
                                'Error while processing subscribed paravalidator groups:',
                                error,
                            );
                        }
                        // lock released
                    },
                );
            },
        );
    }

    async subscribeToCores() {
        if (!this.substrateClient) {
            return;
        }
        console.log(this.substrateClient.query.paraScheduler.availabilityCores);
        if (this.substrateClient.query.paraScheduler.availabilityCores) {
            await this.subscribeToCoresLegacy();
            return;
        }
        this.unsubscribeCores = this.substrateClient.query.paraScheduler.claimQueue(
            // @ts-expect-error untyped
            (data) => {
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const claims = Object.values(data.toJSON() as any[]);
                this.paravalidatorLock.acquire(
                    this.paravalidatorProcessLockKey,
                    (done) => {
                        const assignments = new Map<number, string[]>();
                        this.cores = [];
                        for (let i = 0; i < claims.length; i++) {
                            const claim = claims[i];
                            if (claim[0] != undefined && claim[0].bulk != undefined) {
                                const paraId = claim[0].bulk as number;
                                this.cores.push(paraId);
                                assignments.set(paraId, this.paravalidatorGroups[i]);
                            } else {
                                this.cores.push(undefined);
                            }
                        }
                        this.eventBus.dispatch<Map<number, string[]>>(
                            ChainvizEvent.CORES_UPDATED,
                            assignments,
                        );
                        done();
                    },
                    (error, _) => {
                        if (error) {
                            console.log(
                                'Error while processing subscribed paravalidator groups:',
                                error,
                            );
                        }
                        // lock released
                    },
                );
            },
        );
    }

    /**
     * Called at the initial setup or after a network change to get an initial list of finalized
     * and unfinalized blocks.
     *
     * @returns list of blocks
     */
    async getInitialBlocks() {
        if (!this.substrateClient) {
            return;
        }
        const finalizedBlocks: Block[] = [];
        // get finalized blocks
        const finalizedBlockHash = await this.substrateClient.rpc.chain.getFinalizedHead();
        let finalizedBlock = await this.getBlockByHash(finalizedBlockHash);
        if (finalizedBlock) {
            finalizedBlock.isFinalized = true;
            finalizedBlocks.push(finalizedBlock);
            for (let i = 0; i < Constants.INITIAL_FINALIZED_BLOCK_COUNT - 1; i++) {
                finalizedBlock = await this.getBlockByHash(finalizedBlock.block.header.parentHash);
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
        // get unfinalized blocks
        const unFinalizedBlocks: Block[] = [];
        let unFinalizedHeader = await this.substrateClient.rpc.chain.getHeader();
        while (
            unFinalizedHeader.number.toNumber() != finalizedBlocks[0].block.header.number.toNumber()
        ) {
            const unFinalizedBlock = await this.getBlockByHash(unFinalizedHeader.hash);
            if (unFinalizedBlock) {
                unFinalizedBlocks.push(unFinalizedBlock);
                unFinalizedHeader = await this.substrateClient.rpc.chain.getHeader(
                    unFinalizedHeader.parentHash,
                );
            } else {
                break;
            }
        }
        // join finalized and non-
        this.blocks = [...unFinalizedBlocks, ...finalizedBlocks];
    }

    /**
     * Fetch the list parachain/thread ids from the Substrate node.
     *
     * @returns  parachain/thread ids
     */
    private async getParaIds(): Promise<number[]> {
        if (!this.substrateClient) {
            return [];
        }
        const paraIds: number[] = [];
        const headEntries = await this.substrateClient.query.paras.heads.entries();
        headEntries.forEach(
            ([
                {
                    args: [paraId],
                },
                _value,
            ]) => {
                paraIds.push(Number(paraId.toString()));
            },
        );
        paraIds.sort((a, b) => a - b);
        return paraIds;
    }

    /**
     * Initialize paras list for the selected network. This list is extracted from a static file, which
     * is fetched from the Polkadot JS apps repository.
     */
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

    /**
     * Subscribe to Substrate new block events.
     *
     * @returns unsubscribe promise
     */
    subscribeToNewBlocks() {
        if (!this.substrateClient || this.unsubscribeNewBlock) {
            return;
        }
        this.unsubscribeNewBlock = this.substrateClient!.rpc.chain.subscribeNewHeads(
            async (header) => {
                this.onNewBlock(header);
            },
        );
    }

    /**
     * Subscribe to Substrate finalized block events.
     *
     * @returns unsubscribe promise
     */
    subscribeToFinalizedBlocks() {
        if (!this.substrateClient || this.unsubscribeFinalizedHeader) {
            return;
        }
        this.unsubscribeFinalizedHeader = this.substrateClient!.rpc.chain.subscribeFinalizedHeads(
            async (header) => {
                this.onFinalizedBlock(header);
            },
        );
    }

    /**
     * Insert a new block into its appropriate position in the list of blocks.
     *
     * @param block new block
     */
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

    /**
     * Called when a new block is received from the Substrate node.
     *
     * @param header new block header
     */
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

    /**
     * Called when a new block is received from the Substrate node.
     *
     * @param header new block header
     * @param done completion callback
     */
    private async processNewBlock(header: Header, done?: AsyncLock.AsyncLockDoneCallback<unknown>) {
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
        if (done) {
            done();
        }
    }

    /**
     * Called when a finalized block is received from the Substrate node.
     *
     * @param header finalized block header
     */
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

    /**
     * Called when a finalized block is received from the Substrate node.
     *
     * @param header finalized block header
     * @param done completion callback
     */
    private async processFinalizedBlock(
        header: Header,
        done?: AsyncLock.AsyncLockDoneCallback<unknown>,
    ) {
        // find unfinalized blocks before this one & discard & finalize
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
        for (const removeIndex of removeIndices.slice().reverse()) {
            const removed = this.blocks.splice(removeIndex, 1);
            this.eventBus.dispatch<Block>(ChainvizEvent.DISCARDED_BLOCK, removed[0]);
        }

        if (this.blocks.length > 0) {
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
        if (done) {
            done();
        }
    }

    /**
     * Fetches a block from the Substrate RPC node.
     *
     * @param hash block hash
     * @returns promise for the block with the actual Substrate block, timestamp, events, extrinsics, etc.
     */
    async getBlockByHash(hash: BlockHash): Promise<Block | undefined> {
        if (!this.substrateClient) {
            return undefined;
        }
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

    /**
     * Fetches a block from the Substrate RPC node by block number.
     *
     * @param hash block number
     * @returns promise for the block with the actual Substrate block, timestamp, events, extrinsics, etc.
     */
    async getBlockByNumber(number: number): Promise<Block | undefined> {
        if (!this.substrateClient) {
            return undefined;
        }
        const hash = await this.substrateClient.rpc.chain.getBlockHash(number);
        return this.getBlockByHash(hash);
    }

    /**
     * Fetches a block hash from the Substrate RPC node by block number.
     *
     * @param hash block number
     * @returns promise for the block hash
     */
    async getBlockHash(number: number): Promise<BlockHash | undefined> {
        if (!this.substrateClient) {
            return undefined;
        }
        return await this.substrateClient.rpc.chain.getBlockHash(number);
    }

    /**
     * Fetches the list of recent XCM transfers from the Polkaholic API,
     * and populates the data array.
     */
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
        for (const xcmTransfer of this.xcmTransfers.slice().reverse()) {
            this.eventBus.dispatch<XCMInfo>(ChainvizEvent.NEW_XCM_TRANSFER, xcmTransfer);
        }

        this.xcmTransferGetTimeout = setTimeout(() => {
            this.getXCMTransfers();
        }, Constants.XCM_TRANSFER_FETCH_PERIOD_MS);
    }

    async disconnectSubstrateClient() {
        if (this.unsubscribeNewBlock) {
            await this.unsubscribeNewBlock;
            this.unsubscribeNewBlock = undefined;
        }
        if (this.unsubscribeFinalizedHeader) {
            await this.unsubscribeFinalizedHeader;
            this.unsubscribeFinalizedHeader = undefined;
        }
        if (this.unsubscribeValidators) {
            await this.unsubscribeValidators;
            this.unsubscribeValidators = undefined;
        }
        if (this.unsubscribeParavalidators) {
            await this.unsubscribeParavalidators;
            this.unsubscribeParavalidators = undefined;
        }
        if (this.unsubscribeParavalidatorGroups) {
            await this.unsubscribeParavalidatorGroups;
            this.unsubscribeParavalidatorGroups = undefined;
        }
        if (this.unsubscribeCores) {
            await this.unsubscribeCores;
            this.unsubscribeCores = undefined;
        }

        if (this.substrateClient) {
            try {
                await this.substrateClient.disconnect();
                this.substrateClient = undefined;
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
