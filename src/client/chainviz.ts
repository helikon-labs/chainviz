import * as THREE from "three";
import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
} from "./service/rpc/RPCSubscriptionService";
import { ChainVizScene } from "./scene/scene";
import { ValidatorListUpdate, ValidatorSummary } from "./model/subvt/validator_summary";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header, SignedBlock } from "@polkadot/types/interfaces";
import { NetworkStatusUpdate } from "./model/subvt/network_status";
import { getSS58Address } from "./util/ss58";
import { Constants } from "./util/constants";
import AsyncLock = require("async-lock");
import { CONFIG } from "./util/config";

THREE.Cache.enabled = true;

class ChainViz {
    private scene = new ChainVizScene();
    private readonly networkStatusListener: RPCSubscriptionServiceListener<NetworkStatusUpdate> = {
        onConnected: () => {
            this.networkStatusClient.subscribe();
        },
        onSubscribed: (_subscriptionId: number) => {
            // no-op
        },
        onUnsubscribed: (_subscriptionId: number) => {
            // no-op
        },
        onDisconnected: () => {
            // no-op
        },
        onUpdate: (update: NetworkStatusUpdate) => {
            this.processNetworkStatusUpdate(update);
        },
        onError: (code: number, message: string) => {
            console.log(`Network status service error (${code}: ${message}).`);
        },
    };
    private readonly validatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> = {
        onConnected: () => {
            this.validatorListClientIsConnected = true;
            if (this.substrateClientIsConnected) {
                this.setLoadingStatus(":: connected ::<br>:: waiting for data ::");
            }
            this.subscribeToValidatorList();
        },
        onSubscribed: (_subscriptionId: number) => {
            // no-op
        },
        onUnsubscribed: (_subscriptionId: number) => {
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
        },
    };
    private readonly networkStatusClient: RPCSubscriptionService<NetworkStatusUpdate>;
    private readonly validatorListClient: RPCSubscriptionService<ValidatorListUpdate>;
    private validatorListClientIsConnected = false;
    private substrateClient: ApiPromise = new ApiPromise({
        provider: new WsProvider("wss://rpc.dotters.network/kusama"),
    });
    private substrateClientIsConnected = false;

    private sceneStarted = false;
    private readonly initialBlockCount = 10;
    private initialBlocks = new Array<SignedBlock>();
    private hasReceivedValidatorList = false;
    private initialValidators = new Array<ValidatorSummary>();

    private readonly lock = new AsyncLock();
    private readonly blockPushLockKey = "block_push";

    constructor(networkStatusServerURL: string, activeValidatorListServerURL: string) {
        this.networkStatusClient = new RPCSubscriptionService(
            networkStatusServerURL,
            "subscribe_networkStatus",
            "unsubscribe_networkStatus",
            this.networkStatusListener
        );
        this.validatorListClient = new RPCSubscriptionService(
            activeValidatorListServerURL,
            "subscribe_validatorList",
            "unsubscribe_validatorList",
            this.validatorListListener
        );
    }

    private processValidatorListUpdate(update: ValidatorListUpdate) {
        // calculate addresses
        for (const summary of update.insert) {
            summary.address = getSS58Address(summary.accountId);
        }
        if (!this.sceneStarted && this.initialValidators.length == 0) {
            this.hasReceivedValidatorList = true;
            this.initialValidators.push(...update.insert);
            if (this.initialBlocks.length == this.initialBlockCount) {
                this.startScene();
            }
        } else {
            this.scene.updateValidators(update.update);
            this.scene.removeValidators(update.removeIds);
            setTimeout(() => {
                this.scene.insertValidators(update.insert);
            }, Constants.VALIDATOR_INSERT_DELAY_MS);
        }
    }

    private async getInitialBlocks() {
        await this.substrateClient.isReady;
        this.substrateClientIsConnected = true;
        if (this.validatorListClientIsConnected) {
            this.setLoadingStatus(":: connected ::<br>:: waiting for data ::");
        }
        const lastHeader = await this.substrateClient.rpc.chain.getHeader();
        let block = await this.substrateClient.rpc.chain.getBlock(lastHeader.hash);
        this.initialBlocks.push(block);
        const lastBlockNumber = block.block.header.number.toNumber();
        for (let i = lastBlockNumber - 1; i > lastBlockNumber - this.initialBlockCount; i--) {
            block = await this.substrateClient.rpc.chain.getBlock(block.block.header.parentHash);
            this.initialBlocks.push(block);
        }
        if (this.hasReceivedValidatorList) {
            this.startScene();
        }
    }

    private setLoadingStatus(status: string) {
        const element = document.getElementById("loading-status");
        if (element != undefined) {
            element.innerHTML = status;
        }
    }

    private removeLoadingStatus() {
        document.getElementById("page-spinner")?.remove();
        document.getElementById("loading-status")?.remove();
    }

    private subscribeToValidatorList() {
        this.validatorListClient.subscribe();
    }

    private displayVersion() {
        const element = <HTMLElement>document.getElementById("chainviz-version");
        element.innerHTML = `v${CONFIG.version}`;
    }

    async init() {
        this.setLoadingStatus(":: connecting to services ::");
        this.displayVersion();
        this.getInitialBlocks();
        this.validatorListClient.connect();
    }

    private async startScene() {
        this.sceneStarted = true;
        this.removeLoadingStatus();
        this.scene.start();
        await this.scene.initValidators(this.initialValidators);
        await this.scene.initBlocks(this.initialBlocks);
        this.initialBlocks = [];
        this.initialValidators = [];
        this.subsribeToNewHeads();
        this.subscribeToFinalizedHeads();
        this.networkStatusClient.connect();
    }

    private subsribeToNewHeads() {
        this.substrateClient.rpc.chain.subscribeNewHeads((header) => {
            this.onNewBlock(header);
        });
    }

    private subscribeToFinalizedHeads() {
        this.substrateClient.rpc.chain.subscribeFinalizedHeads((header) => {
            this.onFinalizedBlock(header);
        });
    }

    private async onNewBlock(header: Header) {
        this.lock.acquire(this.blockPushLockKey, async (done) => {
            const extendedHeader = await this.substrateClient.derive.chain.getHeader(header.hash);
            if (extendedHeader) {
                const block = await this.substrateClient.rpc.chain.getBlock(header.hash);
                this.scene.onNewBlock(block.block, extendedHeader);
            }
            done();
        });
    }

    private async onFinalizedBlock(header: Header) {
        this.scene.onFinalizedBlock(header.hash.toHex(), header.number.toNumber());
    }

    private processNetworkStatusUpdate(update: NetworkStatusUpdate) {
        if (update.status) {
            this.scene.initNetworkStatus(update.status);
        } else if (update.diff) {
            this.scene.updateNetworkStatus(update.diff);
        }
    }
}

export { ChainViz };
