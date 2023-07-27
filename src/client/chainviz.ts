import * as THREE from 'three';
import { Chainviz3DScene } from './scene/scene';
import { UI } from './ui/ui';
import { Network, Kusama } from './model/substrate/network';
import { DataStore } from './data/data-store';
import { EventBus } from './event/event-bus';
import { ChainvizEvent } from './event/event';
import { Constants } from './util/constants';
import { NetworkStatus, NetworkStatusUpdate } from './model/subvt/network-status';
import { ValidatorListUpdate, ValidatorSummary } from './model/subvt/validator-summary';
import { Block } from '@polkadot/types/interfaces';
import { Slot } from './model/chainviz/slot';

THREE.Cache.enabled = true;

class Chainviz {
    private readonly ui: UI;
    private readonly scene = new Chainviz3DScene();
    private readonly dataStore: DataStore;
    private readonly eventBus = EventBus.getInstance();
    private network: Network = Kusama;
    private started = false;
    private networkStatus!: NetworkStatus;
    private validatorMap = new Map<string, ValidatorSummary>();
    private slots: Slot[] = [];
    private paraIds: number[] = [];

    constructor() {
        this.ui = new UI();
        this.dataStore = new DataStore();
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
        this.eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_UPDATE,
            (update: ValidatorListUpdate) => {
                this.onActiveValidatorListUpdate(update);
            }
        );
        this.eventBus.register(ChainvizEvent.NEW_BLOCK, (block: Block) => {
            this.onNewBlock(block);
        });
        this.eventBus.register(ChainvizEvent.NEW_FINALIZED_BLOCK, (block: Block) => {
            this.onNewFinalizedBlock(block);
        });
    }

    async init() {
        this.ui.init();
        this.ui.setLoadingInfo('connecting to blockchain');
        await this.connect();
    }

    async connect() {
        this.ui.displayLoading();
        this.dataStore.setNetwork(this.network);
        this.dataStore.connectSubstrateRPC();
    }

    private connectNetworkStatusService() {
        this.ui.setLoadingInfo('connecting to network service');
        setTimeout(() => {
            this.dataStore.connectNetworkStatusService();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    onSubstrateAPITimedOut() {
        this.ui.setLoadingInfo(
            `blockchain connection timed out<br>will retry in ${
                Constants.CONNECTION_RETRY_MS / 1000
            } seconds`
        );
        setTimeout(() => {
            this.dataStore.connectSubstrateRPC();
        }, Constants.CONNECTION_RETRY_MS);
    }

    onNetworkStatusServiceConnected() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo('network service connected');
            setTimeout(() => {
                this.dataStore.subscribeToNetworkStatus();
            }, Constants.UI_STATE_CHANGE_DELAY_MS);
        }
    }

    onNetworkStatusServiceDisconnected() {}

    private onNetworkStatusUpdate(update: NetworkStatusUpdate) {
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
                this.dataStore.connectActiveValidatorListService();
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
            this.dataStore.disconnectNetworkStatusService();
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
                this.dataStore.subscribeToActiveValidatorList();
            }, Constants.UI_STATE_CHANGE_DELAY_MS);
        }
    }

    onActiveValidatorListServiceDisconnected() {}

    onActiveValidatorListServiceSubscribed() {
        this.ui.setLoadingInfo('validator service subscribed');
        setTimeout(() => {
            this.getParas();
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
            this.dataStore.disconnectActiveValidatorListService();
            setTimeout(() => {
                this.connectActiveValidatorListService();
            }, Constants.CONNECTION_RETRY_MS);
        }
    }

    private async getParas() {
        this.ui.setLoadingInfo('fetching parachains');
        this.paraIds = await this.dataStore.getParaIds();
        setTimeout(() => {
            this.getInitialBlocks();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    private async getInitialBlocks() {
        this.ui.setLoadingInfo('fetching blocks');
        this.slots = await this.dataStore.getInitialSlots();
        this.start();
    }

    private onActiveValidatorListUpdate(update: ValidatorListUpdate) {
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

    private onNewBlock(block: Block) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].number == block.header.number.toNumber()) {
                this.slots[i].insertBlock(block);
                this.ui.updateSlot(this.slots[i]);
                return;
            }
        }
        const slot = new Slot(block.header.number.toNumber(), false, [block]);
        this.slots = [slot, ...this.slots];
        if (this.slots.length > Constants.MAX_SLOT_COUNT) {
            this.slots = this.slots.slice(0, Constants.MAX_SLOT_COUNT);
        }
        this.ui.insertSlot(slot);
    }

    private async onNewFinalizedBlock(block: Block) {
        let finalizedNumber = -1;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].number == block.header.number.toNumber()) {
                this.slots[i].finalize(block);
                this.ui.updateSlot(this.slots[i]);
                finalizedNumber = block.header.number.toNumber();
            } else if (this.slots[i].number < finalizedNumber && !this.slots[i].getIsFinalized()) {
                const block = await this.dataStore.getBlockByNumber(this.slots[i].number);
                this.slots[i].finalize(block);
                this.ui.updateSlot(this.slots[i]);
            }
        }
    }

    start() {
        this.started = true;
        this.ui.initializeSlots(this.slots);
        this.ui.start();
        this.dataStore.subsribeToNewBlocks();
        this.dataStore.subsribeToFinalizedBlocks();
    }
}

export { Chainviz };
