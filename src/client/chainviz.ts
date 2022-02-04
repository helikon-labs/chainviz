import * as THREE from 'three';
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from './service/rpc/RPCSubscriptionService';
import { ChainVizScene } from './scene/scene';
import { ValidatorListUpdate } from './model/subvt/validator_summary';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header, SignedBlock } from '@polkadot/types/interfaces';
import { kusama } from './model/app/network';
import { NetworkStatusUpdate } from './model/subvt/network_status';

THREE.Cache.enabled = true;
const network = kusama;

class ChainViz {
    private scene = new ChainVizScene();
    private readonly networkStatusListener: RPCSubscriptionServiceListener<NetworkStatusUpdate> = {
        onConnected: () => {
            this.networkStatusClient.subscribe();
        },
        onSubscribed: (subscriptionId: number) => {
            // no-op
        },
        onUnsubscribed: (subscriptionId: number) => {
            // no-op
        },
        onDisconnected: () => {
            // no-op
        },
        onUpdate: (update: NetworkStatusUpdate) => {
            console.log(`Received network status #${update.status?.finalizedBlockNumber}`);
            // this.processValidatorListUpdate(update);
        },
        onError: (code: number, message: string) => {
            console.log(`Network status service error (${code}: ${message}).`);
        }
    }
    private readonly validatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> = {
        onConnected: () => {
            this.validatorListClientIsConnected = true;
            if (this.substrateClientIsConnected) {
                this.setLoadingStatus(":: connected ::<br>:: waiting for data ::");
            }
            this.subscribeToValidatorList();
        },
        onSubscribed: (subscriptionId: number) => {
            // no-op
        },
        onUnsubscribed: (subscriptionId: number) => {
            // no-op
        },
        onDisconnected: () => {
            // no-op
        },
        onUpdate: (update: ValidatorListUpdate) => {
            this.processValidatorListUpdate(update);
        },
        onError: (code: number, message: string) => {
            console.log(`Validator list service error (${code}: ${message}).`);
        }
    }
    private readonly networkStatusClient = new RPCSubscriptionService(
        "ws://78.181.100.160:17888",
        "subscribe_networkStatus",
        "unsubscribe_networkStatus",
        this.networkStatusListener,
    );
    private readonly validatorListClient = new RPCSubscriptionService(
        "ws://78.181.100.160:17889",
        "subscribe_validatorList",
        "unsubscribe_validatorList",
        this.validatorListListener,
    );
    private validatorListClientIsConnected = false;
    private substrateClient: ApiPromise = new ApiPromise({
        provider: new WsProvider('wss://kusama-rpc.polkadot.io')
    });
    private substrateClientIsConnected = false;

    private sceneStarted = false;
    private readonly initialBlockCount = 10;
    private initialBlocks = new Array<SignedBlock>();
    private initialValidatorListUpdate?: ValidatorListUpdate = undefined;

    private processValidatorListUpdate(update: ValidatorListUpdate) {
        if (!this.sceneStarted && this.initialValidatorListUpdate == undefined) {
            this.initialValidatorListUpdate = update;
            if (this.initialBlocks.length == this.initialBlockCount) {
                this.startScene();
            }
        } else {
            // TODO process update
        }
    }

    private async getInitialBlocks() {
        await this.substrateClient.isReady;
        this.substrateClientIsConnected = true;
        if (this.validatorListClientIsConnected) {
            this.setLoadingStatus(":: connected ::<br>:: waiting for data ::");
        }
        const finalizedHead = await this.substrateClient.rpc.chain.getFinalizedHead();
        let finalizedBlock = await this.substrateClient.rpc.chain.getBlock(finalizedHead);
        this.initialBlocks.push(finalizedBlock)
        const lastBlockNumber = finalizedBlock.block.header.number.toNumber();
        for (
            let i = lastBlockNumber - 1;
            i > (lastBlockNumber - this.initialBlockCount);
            i--
        ) {
            const blockHash = await this.substrateClient.rpc.chain.getBlockHash(i);
            finalizedBlock = await this.substrateClient.rpc.chain.getBlock(blockHash);
            this.initialBlocks.push(finalizedBlock)
        }
        if (this.initialValidatorListUpdate != undefined) {
            this.startScene();
        }
    }

    private setLoadingStatus(status: string) {
        const element = document.getElementById("loading-status");
        if (element != undefined) {
            (element as HTMLElement).innerHTML = status;
        }
    }

    private removeLoadingStatus() {
        document.getElementById("spinner")?.remove();
        document.getElementById("loading-status")?.remove();
    }

    private subscribeToValidatorList() {
        this.validatorListClient.subscribe();
    }

    async init() {
        this.setLoadingStatus(":: connecting to services ::");
        this.getInitialBlocks();
        this.validatorListClient.connect();
    }

    private async startScene() {
        this.sceneStarted = true;
        this.removeLoadingStatus();
        this.scene.start();
        await this.scene.initValidators(this.initialValidatorListUpdate!.insert);
        await this.scene.initBlocks(this.initialBlocks);
        // clear data
        this.initialValidatorListUpdate = undefined;
        this.initialBlocks = [];
        // subscribe to finalized blocks
        this.subscribeToFinalizedBlocks();
        this.networkStatusClient.connect();
    }

    private subscribeToFinalizedBlocks() {
        this.substrateClient.rpc.chain.subscribeFinalizedHeads((header) => {
            this.onFinalizedBlock(header);
        });
    }

    private async onFinalizedBlock(header: Header) {
        const extendedHeader = await this.substrateClient.derive.chain.getHeader(header.hash);
        const block = await this.substrateClient.rpc.chain.getBlock(header.hash);
        this.scene.pushBlock(block.block, extendedHeader?.author?.toHex());
    }
}

export { ChainViz, network };