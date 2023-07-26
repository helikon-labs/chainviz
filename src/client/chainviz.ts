import * as THREE from 'three';
import { Chainviz3DScene } from './scene/scene';
import { UI } from './ui/ui';
import { Network, Kusama } from './model/substrate/network';
import { ConnectionManager } from './data/connection-manager';
import { EventBus } from './event/event-bus';
import { ChainvizEvent } from './event/event';
import { Constants } from './util/constants';
import { NetworkStatus, NetworkStatusUpdate } from './model/subvt/network-status';

THREE.Cache.enabled = true;

class Chainviz {
    private readonly ui: UI;
    private readonly scene = new Chainviz3DScene();
    private readonly connectionManager: ConnectionManager;
    private readonly eventBus = EventBus.getInstance();
    private network: Network = Kusama;
    private started = false;
    private networkStatus!: NetworkStatus;

    constructor() {
        this.ui = new UI();
        this.connectionManager = new ConnectionManager();
        // substrate api events
        this.eventBus.register(ChainvizEvent.SUBSTRATE_API_READY, () => {
            this.connectNetworkStatusService();
        });
        this.eventBus.register(ChainvizEvent.SUBSTRATE_API_CONNECTION_TIMED_OUT, () => {
            this.onSubstrateAPITimedOut();
        });
        // network status service events
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_CONNECTED, () => {
            this.onNetworkStatusServiceConnected();
        });
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_DISCONNECTED, () => {
            this.onNetworkStatusServiceConnected();
        });
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_SUBSCRIBED, () => {
            this.connectActiveValidatorListService();
        });
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_UNSUBSCRIBED, () => {
            this.onNetworkStatusServiceUnsubscribed();
        });
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_ERROR, () => {
            this.onNetworkStatusServiceError();
        });
        this.eventBus.register(
            ChainvizEvent.NETWORK_STATUS_UPDATE,
            (update: NetworkStatusUpdate) => {
                this.onNetworkStatusUpdate(update);
            }
        );
        // active validator list service events
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_CONNECTED, () => {
            this.onActiveValidatorListServiceConnected();
        });
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_DISCONNECTED, () => {
            this.onActiveValidatorListServiceConnected();
        });
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_SUBSCRIBED, () => {
            this.onActiveValidatorListServiceSubscribed();
        });
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_UNSUBSCRIBED, () => {
            this.onActiveValidatorListServiceUnsubscribed();
        });
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_SERVICE_ERROR, () => {
            this.onActiveValidatorListServiceError();
        });
    }

    async init() {
        this.ui.init();
        this.ui.setLoadingInfo('connecting to blockchain');
        await this.connect();
    }

    async connect() {
        this.ui.displayLoading();
        this.connectionManager.setNetwork(this.network);
        this.connectionManager.connectSubstrateRPC();
    }

    private connectNetworkStatusService() {
        this.ui.setLoadingInfo('connecting to network service');
        setTimeout(() => {
            this.connectionManager.connectNetworkStatusService();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    onSubstrateAPITimedOut() {
        this.ui.setLoadingInfo(
            `blockchain connection timed out<br>will retry in ${
                Constants.CONNECTION_RETRY_MS / 1000
            } seconds`
        );
        setTimeout(() => {
            this.connectionManager.connectSubstrateRPC();
        }, Constants.CONNECTION_RETRY_MS);
    }

    onNetworkStatusServiceConnected() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo('network service connected');
            setTimeout(() => {
                this.connectionManager.subscribeToNetworkStatus();
            }, Constants.UI_STATE_CHANGE_DELAY_MS);
        }
    }

    onNetworkStatusServiceDisconnected() {}

    onNetworkStatusUpdate(update: NetworkStatusUpdate) {
        if (update.status) {
            this.networkStatus = update.status;
        } else if (update.diff) {
            Object.assign(this.networkStatus, update.diff);
        }
        this.ui.displayNetworkStatus(this.network, this.networkStatus);
    }

    private connectActiveValidatorListService() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo('connect to validator service');
            setTimeout(() => {
                this.connectionManager.connectActiveValidatorListService();
            }, Constants.UI_STATE_CHANGE_DELAY_MS);
        }
    }

    onNetworkStatusServiceUnsubscribed() {
        // no-op
    }

    onNetworkStatusServiceError() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo(
                `network service error<br>will retry in ${
                    Constants.CONNECTION_RETRY_MS / 1000
                } seconds`
            );
            this.connectionManager.disconnectNetworkStatusService();
            setTimeout(() => {
                this.connectNetworkStatusService();
            }, Constants.CONNECTION_RETRY_MS);
        }
    }

    onActiveValidatorListServiceConnected() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo('validator service connected');
            setTimeout(() => {
                this.connectionManager.subscribeToActiveValidatorList();
            }, Constants.UI_STATE_CHANGE_DELAY_MS);
        }
    }

    onActiveValidatorListServiceDisconnected() {}

    onActiveValidatorListServiceSubscribed() {
        this.ui.setLoadingInfo('validator service subscribed');
        setTimeout(() => {
            this.start();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    onActiveValidatorListServiceUnsubscribed() {}

    onActiveValidatorListServiceError() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo(
                `validator service error<br>will retry in ${
                    Constants.CONNECTION_RETRY_MS / 1000
                } seconds`
            );
            this.connectionManager.disconnectActiveValidatorListService();
            setTimeout(() => {
                this.connectActiveValidatorListService();
            }, Constants.CONNECTION_RETRY_MS);
        }
    }

    start() {
        this.started = true;
        this.ui.start();
    }
}

export { Chainviz };
