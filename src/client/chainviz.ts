import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener,
    RPCSubscriptionServiceState,
} from './service/rpc/RPCSubscriptionService';
import { ChainVizScene } from './scene/scene';
import { ValidatorListUpdate } from './model/subvt/validator_summary';
import { ApiPromise, WsProvider } from '@polkadot/api';

class ChainViz {
    private readonly scene: ChainVizScene = new ChainVizScene();
    private hasReceivedFirstUpdate = false;
    private readonly validatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> = {
        onConnected: () => {
            console.log("Connected.");
            if (this.substrateClient != undefined) {
                this.subscribeToValidatorList();
            }
        },
        onSubscribed: (subscriptionId: number) => {
            console.log(`Subscribed to validator list with subscription id #${subscriptionId}.`);
        },
        onUnsubscribed: (subscriptionId: number) => {
            console.log(`Unsubscribed from validator list with subscription id #${subscriptionId}.`);
        },
        onDisconnected: () => {
            console.log("Disconnected from validator list service.");
        },
        onUpdate: (update: ValidatorListUpdate) => {
            this.processValidatorListUpdate(update);
        },
        onError: (code: number, message: string) => {
            console.log(`Validator list service error (${code}: ${message}).`);
        }
    }
    private readonly validatorListClient = new RPCSubscriptionService(
        "ws://78.181.100.160:17889",
        "subscribe_validatorList",
        "unsubscribe_validatorList",
        this.validatorListListener,
    );
    private readonly substrateWSProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
    private substrateClient!: ApiPromise

    private processValidatorListUpdate(update: ValidatorListUpdate) {
        if (!this.hasReceivedFirstUpdate) {
            this.scene.start();
            document.getElementById("spinner")?.remove();
            document.getElementById("loading-status")?.remove();
            this.hasReceivedFirstUpdate = true;
        }
        if (update.insert.length > 0) {
            this.scene.initValidators(update.insert);
        }
    }

    private addBlocks() {
        this.scene.addBlocks();
    }

    private connectSubstrateAPI() {
        ApiPromise
            .create({ provider: this.substrateWSProvider })
            .then((api) => {
                    this.substrateClient = api;
                    console.log(api.genesisHash.toHex());
                    if (this.validatorListClient.getState() == RPCSubscriptionServiceState.Connected) {
                        this.subscribeToValidatorList();
                    }
                }
            );
    }

    private subscribeToValidatorList() {
        this.setLoadingStatus(":: connected ::<br>:: waiting for data ::");
        this.validatorListClient.subscribe();
    }

    private setLoadingStatus(status: string) {
        const element = document.getElementById("loading-status") as HTMLElement;
        element.innerHTML = status;
    }

    async init() {
        this.setLoadingStatus(":: connecting to services ::");
        this.validatorListClient.connect();
        this.connectSubstrateAPI();
    }
}

export { ChainViz }