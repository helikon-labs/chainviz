import { Kusama, Network, Polkadot } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { Constants } from '../util/constants';
import { createTween, startTween } from '../util/tween';
import { show } from '../util/ui-util';
import { NetworkStatusBoard } from './network-status-board';
import { BlockList } from './block-list';
import * as TWEEN from '@tweenjs/tween.js';
import { XCMTransferList, XCMTransferListDelegate } from './xcm-transfer-list';
import { Para } from '../model/substrate/para';
import { Scene, SceneDelegate } from '../scene/scene';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { EventBus } from '../event/event-bus';
import { ChainvizEvent } from '../event/event';
import { ValidatorSummaryBoard } from './validator-summary-board';
import { cloneJSONSafeObject } from '../util/object';
import { Vector2 } from 'three';
import { ParaSummaryBoard } from './para-summary-board';
import { XCMInfo } from '../model/polkaholic/xcm';
import { Block } from '../model/chainviz/block';
import { ValidatorDetailsBoard, ValidatorDetailsBoardDelegate } from './validator-details-board';
import { XCMTransferDetailsBoard } from './xcm-transfer-details-board';
import { ValidatorList, ValidatorListDelegate } from './validator-list';
import { Menu, MenuItem } from './menu';

/**
 * Chainviz top-level UI.
 */
class UI {
    private readonly scene: Scene;
    private readonly root: HTMLElement;
    private readonly sceneContainer: HTMLDivElement;
    private readonly background: HTMLDivElement;
    private readonly content: HTMLDivElement;
    private readonly leftPanel: HTMLDivElement;
    private readonly xcmTransferList: XCMTransferList;
    private readonly centerPanel: HTMLDivElement;
    private readonly leftKusamaSelector: HTMLDivElement;
    private readonly centerKusamaSelector: HTMLDivElement;
    private readonly leftPolkadotSelector: HTMLDivElement;
    private readonly centerPolkadotSelector: HTMLDivElement;
    private readonly rightPanel: HTMLDivElement;
    private readonly networkStatusBoard: NetworkStatusBoard;
    private readonly blockList: BlockList;
    private readonly newBlockList: BlockList;
    private readonly loadingContainer: HTMLDivElement;
    private readonly loadingInfo: HTMLDivElement;
    private readonly eventBus = EventBus.getInstance();
    private isChangingNetwork = false;
    private readonly validatorSummaryBoard: ValidatorSummaryBoard;
    private readonly validatorHighlightCircle: HTMLDivElement;
    private readonly paraSummaryBoard: ParaSummaryBoard;
    private readonly validatorDetailsBoard: ValidatorDetailsBoard;
    private readonly xcmTransferDetailsBoard: XCMTransferDetailsBoard;
    private readonly validatorList: ValidatorList;
    private readonly menu: Menu;
    private highlightedValidatorStashAddress: string | undefined = undefined;
    private highlightedPara: Para | undefined = undefined;

    constructor(
        sceneDelegate: SceneDelegate,
        validatorListDelegate: ValidatorListDelegate,
        xcmTransferListDelegate: XCMTransferListDelegate,
    ) {
        this.root = <HTMLElement>document.getElementById('root');
        this.sceneContainer = <HTMLDivElement>document.getElementById('scene-container');
        this.background = <HTMLDivElement>document.getElementById('background');
        this.content = <HTMLDivElement>document.getElementById('content');
        this.leftPanel = <HTMLDivElement>document.getElementById('left-panel');
        this.xcmTransferList = new XCMTransferList(xcmTransferListDelegate);
        this.centerPanel = <HTMLDivElement>document.getElementById('center-panel');
        this.leftKusamaSelector = <HTMLDivElement>document.getElementById('left-kusama-selector');
        this.centerKusamaSelector = <HTMLDivElement>(
            document.getElementById('center-kusama-selector')
        );
        this.leftPolkadotSelector = <HTMLDivElement>(
            document.getElementById('left-polkadot-selector')
        );
        this.centerPolkadotSelector = <HTMLDivElement>(
            document.getElementById('center-polkadot-selector')
        );
        this.rightPanel = <HTMLDivElement>document.getElementById('right-panel');
        this.networkStatusBoard = new NetworkStatusBoard();
        this.blockList = new BlockList('block-list', false);
        this.newBlockList = new BlockList('new-block-list', true);
        this.loadingContainer = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingInfo = <HTMLDivElement>document.getElementById('loading-info');
        this.validatorSummaryBoard = new ValidatorSummaryBoard();
        this.validatorHighlightCircle = <HTMLDivElement>(
            document.getElementById('validator-highlight-circle')
        );
        this.paraSummaryBoard = new ParaSummaryBoard();
        this.validatorDetailsBoard = new ValidatorDetailsBoard(<ValidatorDetailsBoardDelegate>{
            onClose: () => {
                this.scene.clearValidatorSelection();
            },
        });
        this.xcmTransferDetailsBoard = new XCMTransferDetailsBoard();
        this.validatorList = new ValidatorList(validatorListDelegate);
        this.menu = new Menu();

        this.scene = new Scene(this.sceneContainer, sceneDelegate);
        this.leftKusamaSelector.addEventListener('click', (_event) => {
            this.selectKusama();
        });
        this.centerKusamaSelector.addEventListener('click', (_event) => {
            this.selectKusama();
        });
        this.leftPolkadotSelector.addEventListener('click', (_event) => {
            this.selectPolkadot();
        });
        this.centerPolkadotSelector.addEventListener('click', (_event) => {
            this.selectPolkadot();
        });

        window.onmousemove = (event) => {
            if (
                this.validatorDetailsBoard.getMouseIsInside() ||
                this.xcmTransferDetailsBoard.getMouseIsInside() ||
                this.blockList.getMouseIsInsideBlockDetailsBoard()
            ) {
                return;
            }
            this.scene.onMouseMove(event);
        };
    }

    private selectKusama() {
        if (this.isChangingNetwork) {
            return;
        }
        this.leftKusamaSelector.classList.add('active');
        this.centerKusamaSelector.classList.add('active');
        this.leftPolkadotSelector.classList.remove('active');
        this.centerPolkadotSelector.classList.remove('active');
        this.selectNetwork(Kusama);
    }

    private selectPolkadot() {
        if (this.isChangingNetwork) {
            return;
        }
        this.leftKusamaSelector.classList.remove('active');
        this.centerKusamaSelector.classList.remove('active');
        this.leftPolkadotSelector.classList.add('active');
        this.centerPolkadotSelector.classList.add('active');
        this.selectNetwork(Polkadot);
    }

    init() {
        this.animate();
    }

    /**
     * Called at each frame.
     */
    animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        TWEEN.update();
        this.scene.animate();
        this.updateValidatorHighlightCirclePosition();
    }

    setLoadingInfo(info: string) {
        this.loadingInfo.innerHTML = info;
    }

    private fadeOutLoadingContainer(onComplete: () => void) {
        const opacity = { opacity: 100 };
        const tween = createTween(
            opacity,
            { opacity: 0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.loadingContainer.style.opacity = `${opacity.opacity}%`;
            },
            () => {
                this.loadingContainer.style.display = 'none';
                onComplete();
            },
        );
        startTween(tween);
    }

    private fadeInLoadingContainer(onComplete: () => void) {
        this.loadingContainer.style.display = 'flex';
        const opacity = { opacity: 0 };
        const tween = createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.loadingContainer.style.opacity = `${opacity.opacity}%`;
            },
            () => {
                onComplete();
            },
        );
        startTween(tween);
    }

    private fadeInBackground(onComplete: () => void) {
        this.background.style.opacity = '0%';
        this.background.classList.remove('hidden');
        show(this.background);
        const opacity = { opacity: 0 };
        const tween = createTween(
            opacity,
            { opacity: 80 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.background.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        );
        startTween(tween);
    }

    private fadeInContent(onComplete?: () => void) {
        this.content.style.opacity = '0%';
        this.content.classList.remove('hidden');
        show(this.content);
        const opacity = { opacity: 0 };
        const tween = createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.content.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        );
        startTween(tween);
    }

    private fadeOutForNetworkChange(onComplete?: () => void) {
        const opacity = { opacity: 100 };
        const tween = createTween(
            opacity,
            { opacity: 0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.menu.setOpacity(opacity.opacity);
                this.validatorList.setOpacity(opacity.opacity);
                this.xcmTransferList.setOpacity(opacity.opacity);
                this.networkStatusBoard.setOpacity(opacity.opacity);
                this.blockList.setOpacity(opacity.opacity);
                this.sceneContainer.style.opacity = `${opacity.opacity}%`;
            },
            () => {
                if (onComplete) {
                    this.menu.select(MenuItem.Main);
                    this.validatorList.clearFilter();
                    onComplete();
                }
            },
        );
        startTween(tween);
    }

    private fadeInAfterNetworkChange(onComplete?: () => void) {
        const opacity = { opacity: 0 };
        const tween = createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.menu.setOpacity(opacity.opacity);
                this.validatorList.setOpacity(opacity.opacity);
                this.xcmTransferList.setOpacity(opacity.opacity);
                this.networkStatusBoard.setOpacity(opacity.opacity);
                this.blockList.setOpacity(opacity.opacity);
                this.sceneContainer.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        );
        startTween(tween);
    }

    start(
        blocks: Block[],
        paras: Para[],
        validatorMap: Map<string, ValidatorSummary>,
        onComplete?: () => void,
    ) {
        this.clearBlocks();
        this.clearXCMTransfers();
        this.clearValidatorList();
        this.fadeOutLoadingContainer(() => {
            if (this.isChangingNetwork) {
                this.blockList.initialize(blocks);
                this.validatorList.initialize(validatorMap);
                this.scene.start(paras, validatorMap);
                this.fadeInAfterNetworkChange(() => {
                    this.isChangingNetwork = false;
                    if (onComplete) {
                        onComplete();
                    }
                });
            } else {
                this.fadeInBackground(() => {
                    this.blockList.initialize(blocks);
                    this.validatorList.initialize(validatorMap);
                    this.fadeInContent();
                    this.scene.start(paras, validatorMap, () => {
                        if (onComplete) {
                            onComplete();
                        }
                    });
                });
            }
        });
    }

    prepareForNetworkChange(onComplete?: () => void) {
        this.isChangingNetwork = true;
        this.blockList.closeBlockDetailsBoard();
        this.validatorDetailsBoard.close();
        this.xcmTransferDetailsBoard.close();
        this.scene.reset(() => {
            this.fadeOutForNetworkChange(() => {
                this.fadeInLoadingContainer(() => {
                    if (onComplete) {
                        onComplete();
                    }
                });
            });
        });
    }

    displayNetworkStatus(network: Network, status: NetworkStatus) {
        this.networkStatusBoard.display(network, status);
    }

    private clearBlocks() {
        this.blockList.initialize([]);
    }

    onNewBlock(block: Block) {
        if (this.menu.getCurrentItem() == MenuItem.Main && !document.hidden) {
            this.networkStatusBoard.onNewBlock();
            this.newBlockList.onNewBlock(block);
            this.scene.onNewBlock(
                block,
                () => {
                    this.newBlockList.showBlock(block);
                },
                () => {
                    this.newBlockList.onDiscardedBlock(block);
                    this.blockList.onNewBlock(block);
                },
            );
        } else {
            this.blockList.onNewBlock(block);
        }
    }

    onFinalizedBlock(block: Block) {
        this.blockList.onFinalizedBlock(block);
    }

    onDiscardedBlock(block: Block) {
        this.blockList.onDiscardedBlock(block);
    }

    private clearXCMTransfers() {
        this.xcmTransferList.clear();
    }

    insertXCMTransfers(network: Network, xcmTransfers: XCMInfo[]) {
        this.xcmTransferList.insertXCMTransfers(network, xcmTransfers);
    }

    removeXCMTransfers(xcmTransfers: XCMInfo[]) {
        this.xcmTransferList.removeXCMTransfers(xcmTransfers);
    }

    private selectNetwork(network: Network) {
        this.eventBus.dispatch<Network>(ChainvizEvent.NETWORK_SELECTED, network);
    }

    showValidatorSummaryBoard(
        network: Network,
        validatorSummary: ValidatorSummary,
        position: Vector2,
        para: Para | undefined,
    ) {
        this.validatorSummaryBoard.show(network, validatorSummary, para);
        this.validatorSummaryBoard.setPosition(
            position.x + this.sceneContainer.getBoundingClientRect().left,
            position.y + this.sceneContainer.getBoundingClientRect().top,
        );
    }

    hideValidatorSummaryBoard() {
        this.validatorSummaryBoard.close();
    }

    updateValidatorHighlightCirclePosition() {
        if (this.highlightedValidatorStashAddress != undefined) {
            const position = this.scene.getValidatorOnScreenPosition(
                this.highlightedValidatorStashAddress,
            );
            if (position != undefined) {
                const x = position.x - 10.5;
                const y = this.sceneContainer.getBoundingClientRect().top + position.y - 10.5;
                this.validatorHighlightCircle.style.left = `${x}px`;
                this.validatorHighlightCircle.style.top = `${y}px`;
            }
        }
    }

    highlightValidator(
        network: Network,
        validator: ValidatorSummary,
        paraId: number | undefined,
        highlightValidatorInScene: boolean,
        showValidatorSummaryBoard: boolean,
    ) {
        const para = network.paras.find((p) => p.paraId == paraId);
        const position = this.scene.getValidatorOnScreenPosition(validator.address);
        if (position != undefined) {
            if (highlightValidatorInScene) {
                this.scene.highlightValidator(validator, paraId);
            }
            if (showValidatorSummaryBoard) {
                this.showValidatorSummaryBoard(
                    network,
                    cloneJSONSafeObject(validator),
                    position,
                    para,
                );
            }
            this.highlightedValidatorStashAddress = validator.address;
            this.validatorHighlightCircle.style.display = 'block';
        }
    }

    clearValidatorHighlight() {
        this.scene.clearValidatorHighlight();
        this.hideValidatorSummaryBoard();
        this.validatorHighlightCircle.style.display = 'none';
    }

    selectValidator(network: Network, validator: ValidatorSummary, para: Para | undefined) {
        this.validatorDetailsBoard.show(network, validator, para);
        this.scene.selectValidator(validator.address);
    }

    highlightParas(paraIds: number[]) {
        this.scene.highlightParas(paraIds);
    }

    highlightPara(para: Para, paravalidatorStashAdresses: string[]) {
        this.scene.highlightPara(para.paraId, paravalidatorStashAdresses);
        const position = this.scene.getParaOnScreenPosition(para.paraId);
        this.showParaSummaryBoard(para, paravalidatorStashAdresses.length, position);
        this.highlightedPara = para;
    }

    clearParaHighlight() {
        this.scene.clearParaHighlight();
        this.hideParaSummaryBoard();
        this.highlightedPara = undefined;
    }

    showParaSummaryBoard(para: Para, paravalidatorCount: number, position: Vector2) {
        this.paraSummaryBoard.show(para, paravalidatorCount);
        this.paraSummaryBoard.setPosition(
            position.x + this.sceneContainer.getBoundingClientRect().left,
            position.y + this.sceneContainer.getBoundingClientRect().top,
        );
    }

    hideParaSummaryBoard() {
        this.paraSummaryBoard.hide();
    }

    showXCMTransferDetailsBoard(transfer: XCMInfo) {
        this.xcmTransferDetailsBoard.display(transfer);
    }

    onValidatorsAdded(newValidators: ValidatorSummary[]) {
        this.scene.onValidatorsAdded(newValidators);
        for (const newValidator of newValidators) {
            this.validatorList.onValidatorAdded(cloneJSONSafeObject(newValidator));
        }
    }

    onValidatorsUpdated(network: Network, updatedValidators: ValidatorSummary[]) {
        this.scene.onValidatorsUpdated(updatedValidators);
        for (const updatedValidator of updatedValidators) {
            this.validatorSummaryBoard.onValidatorUpdated(network, updatedValidator, undefined);
            this.validatorDetailsBoard.onValidatorUpdated(network, updatedValidator, undefined);
        }
    }

    onValidatorsRemoved(removedStashAddresses: string[]) {
        this.scene.onValidatorsRemoved(removedStashAddresses);
        for (const removedStashAddress of removedStashAddresses) {
            this.validatorSummaryBoard.onValidatorRemoved(removedStashAddress);
            this.validatorDetailsBoard.onValidatorRemoved(removedStashAddress);
            this.validatorList.onValidatorRemoved(removedStashAddress);
        }
    }

    onCoresUpdated(assignments: Map<number, string[]>) {
        this.scene.onCoresUpdated(assignments);
        if (this.highlightedPara != undefined) {
            const stashAddresses = assignments.get(this.highlightedPara.paraId) ?? [];
            this.showParaSummaryBoard(
                this.highlightedPara,
                stashAddresses.length,
                this.scene.getParaOnScreenPosition(this.highlightedPara.paraId),
            );
        }
    }

    clearValidatorList() {
        this.validatorList.clear();
    }
}

export { UI };
