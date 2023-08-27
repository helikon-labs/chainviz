import * as THREE from 'three';
import { UI } from './ui/ui';
import { Network, Kusama } from './model/substrate/network';
import { DataStore } from './data/data-store';
import { EventBus } from './event/event-bus';
import { ChainvizEvent } from './event/event';
import { Constants } from './util/constants';
import { NetworkStatus } from './model/subvt/network-status';
import { ValidatorSummary } from './model/subvt/validator-summary';
import { Block } from './model/chainviz/block';
import { XCMInfo } from './model/polkaholic/xcm';
import { SceneDelegate } from './scene/scene';
import { XCMTransferListDelegate } from './ui/xcm-transfer-list';
import { ValidatorListDelegate } from './ui/validator-list';

THREE.Cache.enabled = true;

class Chainviz {
    private readonly ui: UI;
    private readonly dataStore: DataStore;
    private readonly eventBus = EventBus.getInstance();
    private network: Network = Kusama;
    private started = false;

    private readonly sceneDelegate = <SceneDelegate>{
        onValidatorMouseEnter: (validator: ValidatorSummary) => {
            this.ui.highlightValidator(this.network, validator, true, true);
        },
        onValidatorMouseLeave: () => {
            this.ui.clearValidatorHighlight();
        },
        onParaMouseEnter: (paraId: number) => {
            const para = this.dataStore.getParaById(paraId);
            if (para != undefined) {
                const paravalidatorStashAdresses =
                    this.dataStore.getParavalidatorStashAddresses(para);
                this.ui.highlightPara(para, paravalidatorStashAdresses);
            }
        },
        onParaMouseLeave: () => {
            this.ui.clearParaHighlight();
        },
        onValidatorClick: (index: number, validator: ValidatorSummary) => {
            this.ui.selectValidator(this.network, validator);
        },
    };

    private readonly validatorListDelegate = <ValidatorListDelegate>{
        onMouseOver: (stashAddress: string) => {
            const validator = this.dataStore.validatorMap.get(stashAddress);
            if (validator) {
                this.ui.highlightValidator(this.network, validator, false, false);
            }
        },
        onMouseLeave: (_stashAddress: string) => {
            this.ui.clearValidatorHighlight();
        },
        onClick: (stashAddress: string) => {
            const validator = this.dataStore.validatorMap.get(stashAddress);
            if (validator) {
                this.ui.selectValidator(this.network, validator);
            }
        },
    };

    private readonly xcmTransferListDelegate = <XCMTransferListDelegate>{
        onClick: (originExtrinsicHash: string) => {
            const transfer =
                this.dataStore.getXCMTransferByOriginExtrinsicHash(originExtrinsicHash);
            if (transfer) {
                this.ui.showXCMTransferDetailsBoard(transfer);
            }
        },
        onMouseEnter: (originExtrinsicHash: string) => {
            const transfer =
                this.dataStore.getXCMTransferByOriginExtrinsicHash(originExtrinsicHash);
            if (transfer) {
                const paraIds: number[] = [];
                if (transfer.origination.paraID > 0) {
                    paraIds.push(transfer.origination.paraID);
                }
                if (transfer.destination.paraID) {
                    paraIds.push(transfer.destination.paraID);
                }
                this.ui.highlightParas(paraIds);
            }
        },
        onMouseLeave: (_originExtrinsicHash: string) => {
            this.ui.clearParaHighlight();
        },
    };

    constructor() {
        this.ui = new UI(
            this.sceneDelegate,
            this.validatorListDelegate,
            this.xcmTransferListDelegate,
        );

        this.dataStore = new DataStore();
        // substrate api events
        this.eventBus.register(ChainvizEvent.SUBSTRATE_API_READY, () => {
            this.connectNetworkStatusService();
        });
        this.eventBus.register(ChainvizEvent.SUBSTRATE_API_CONNECTION_TIMED_OUT, () => {
            this.onSubstrateAPITimedOut();
        });
        this.eventBus.register(ChainvizEvent.NEW_BLOCK, (block: Block) => {
            this.onNewBlock(block);
        });
        this.eventBus.register(ChainvizEvent.FINALIZED_BLOCK, (block: Block) => {
            this.onFinalizedBlock(block);
        });
        this.eventBus.register(ChainvizEvent.DISCARDED_BLOCK, (block: Block) => {
            this.onDiscardedBlock(block);
        });
        // network status service events
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_CONNECTED, () => {
            this.onNetworkStatusServiceConnected();
        });
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_SERVICE_DISCONNECTED, () => {
            this.onNetworkStatusServiceDisconnected();
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
        this.eventBus.register(ChainvizEvent.NETWORK_STATUS_UPDATE, (status: NetworkStatus) => {
            this.onNetworkStatusUpdate(status);
        });
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
        this.eventBus.register(ChainvizEvent.ACTIVE_VALIDATOR_LIST_INITIALIZED, () => {
            this.onActiveValidatorListInitialized();
        });
        this.eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_ADDED,
            (newValidators: ValidatorSummary[]) => {
                this.onActiveValidatorListAdded(newValidators);
            },
        );
        this.eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_UPDATED,
            (updatedValidators: ValidatorSummary[]) => {
                this.onActiveValidatorListUpdated(updatedValidators);
            },
        );
        this.eventBus.register(
            ChainvizEvent.ACTIVE_VALIDATOR_LIST_REMOVED,
            (removedStashAddresses: string[]) => {
                this.onActiveValidatorListRemoved(removedStashAddresses);
            },
        );
        this.eventBus.register(ChainvizEvent.NETWORK_SELECTED, (network: Network) => {
            this.onNetworkSelected(network);
        });
        this.eventBus.register(ChainvizEvent.NEW_XCM_TRANSFER, (xcmTransfer: XCMInfo) => {
            this.ui.insertXCMTransfers(this.network, [xcmTransfer]);
        });
        this.eventBus.register(ChainvizEvent.XCM_TRANSFERS_DISCARDED, (xcmTransfers: XCMInfo[]) => {
            this.ui.removeXCMTransfers(xcmTransfers);
        });
    }

    async init() {
        this.ui.init();
        await this.connect();
    }

    async connect() {
        this.ui.displayLoading();
        await this.dataStore.setNetwork(this.network);
        this.ui.setLoadingInfo('connecting to blockchain');
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
            } seconds`,
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

    onNetworkStatusServiceDisconnected() {
        // no-op
    }

    private onNetworkStatusUpdate(status: NetworkStatus) {
        this.ui.displayNetworkStatus(this.network, status);
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
                } seconds`,
            );
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

    onActiveValidatorListServiceDisconnected() {
        // no-op
    }

    onActiveValidatorListServiceSubscribed() {
        this.ui.setLoadingInfo('validator service subscribed<br>waiting for data');
    }

    onActiveValidatorListServiceUnsubscribed() {}

    onActiveValidatorListServiceError() {
        if (this.started) {
            // no-op
        } else {
            this.ui.setLoadingInfo(
                `validator service error<br>will retry in ${
                    Constants.CONNECTION_RETRY_MS / 1000
                } seconds`,
            );
            setTimeout(() => {
                this.connectActiveValidatorListService();
            }, Constants.CONNECTION_RETRY_MS);
        }
    }

    private async getParas() {
        this.ui.setLoadingInfo('fetching parachains');
        this.dataStore.getParas();
        setTimeout(() => {
            this.getInitialBlocks();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    private async getInitialBlocks() {
        this.ui.setLoadingInfo('fetching blocks');
        await this.dataStore.getInitialBlocks();
        this.start();
    }

    private onActiveValidatorListInitialized() {
        setTimeout(() => {
            this.getParas();
        }, Constants.UI_STATE_CHANGE_DELAY_MS);
    }

    private onActiveValidatorListAdded(newValidators: ValidatorSummary[]) {
        this.ui.onValidatorsAdded(newValidators);
    }

    private onActiveValidatorListUpdated(updatedValidators: ValidatorSummary[]) {
        this.ui.onValidatorsUpdated(this.network, updatedValidators);
    }

    private onActiveValidatorListRemoved(removedStashAddresses: string[]) {
        this.ui.onValidatorsRemoved(removedStashAddresses);
    }

    private onNewBlock(block: Block) {
        if (this.started) {
            this.ui.onNewBlock(block);
        }
    }

    private async onFinalizedBlock(block: Block) {
        this.ui.onFinalizedBlock(block);
    }

    private async onDiscardedBlock(block: Block) {
        this.ui.onDiscardedBlock(block);
    }

    async onNetworkSelected(network: Network) {
        this.network = network;
        await this.dataStore.setNetwork(this.network);
        this.ui.prepareForNetworkChange(() => {
            this.started = false;
            this.ui.setLoadingInfo('connecting to blockchain');
            this.dataStore.connectSubstrateRPC();
        });
    }

    start() {
        this.ui.start(
            this.dataStore.blocks,
            this.dataStore.paras,
            this.dataStore.validatorMap,
            () => {
                this.dataStore.subscribeToNewBlocks();
                this.dataStore.subscribeToFinalizedBlocks();
                this.dataStore.getXCMTransfers();
                this.started = true;
            },
        );
    }
}

export { Chainviz };
