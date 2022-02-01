import {
    RPCSubscriptionService,
    RPCSubscriptionServiceListener
} from './service/rpc/RPCSubscriptionService';
import { ChainVizScene } from './scene/scene';
import { ValidatorListUpdate } from './model/subvt/validator_summary';

class ChainViz {
    private readonly scene: ChainVizScene = new ChainVizScene();

    private readonly validatorListListener: RPCSubscriptionServiceListener<ValidatorListUpdate> = {
        onConnected: () => {
            console.log("Connected.");
            this.validatorListClient.subscribe();
        },
        onSubscribed: (subscriptionId: number) => {
            console.log("Subscribed: " + subscriptionId);
        },
        onUnsubscribed: (subscriptionId: number) => {
            console.log("Unsubscribed: " + subscriptionId);
        },
        onDisconnected: () => {
            console.log("Disconnected");
        },
        onUpdate: (update: ValidatorListUpdate) => {
            this.processValidatorListUpdate(update);
        },
        onError: (code: number, message: string) => {
            
        }
    }
    private readonly validatorListClient = new RPCSubscriptionService(
        "ws://78.181.100.160:17889",
        "subscribe_validatorList",
        "unsubscribe_validatorList",
        this.validatorListListener,
    );

    async start() {
        this.validatorListClient.connect();
        this.scene.start();
    }

    private processValidatorListUpdate(update: ValidatorListUpdate) {
        console.log("Block #" + update.finalizedBlockNumber);
        console.log("Insert count: " + update.insert.length);
        console.log("Update count: " + update.update.length);
        console.log("Remove count: " + update.removeIds.length);
        if (update.insert.length > 0) {
            this.scene.addValidators(update.insert);
        }
    }
}

export { ChainViz }