import { Slot } from '../model/chainviz/slot';
import { Kusama, Network, Polkadot } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import { show } from '../util/ui-util';
import { Logo, getRandomCharacterType, getRandomShapeType } from './logo';
import { NetworkStatusBoard } from './network-status-board';
import { SlotList } from './slot-list';
import * as TWEEN from '@tweenjs/tween.js';
import { XCMMessageList } from './xcm-message-list';
import { Para } from '../model/substrate/para';
import { Scene, SceneDelegate } from '../scene/scene';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { EventBus } from '../event/event-bus';
import { ChainvizEvent } from '../event/event';
import { ValidatorSummaryBoard } from './validator-summary-board';
import { cloneJSONSafeObject } from '../util/object';
import { Vec2 } from 'three';
import { ParaSummaryBoard } from './para-summary-board';

class UI {
    private readonly scene: Scene;
    private readonly root: HTMLElement;
    private readonly sceneContainer: HTMLDivElement;
    private readonly background: HTMLDivElement;
    private readonly content: HTMLDivElement;
    private readonly leftPanel: HTMLDivElement;
    private readonly mainLogoCanvas: HTMLCanvasElement;
    private readonly logo: Logo;
    private readonly xcmMessageList: XCMMessageList;
    private readonly centerPanel: HTMLDivElement;
    private readonly kusamaSelector: HTMLDivElement;
    private readonly polkadotSelector: HTMLDivElement;
    private readonly rightPanel: HTMLDivElement;
    private readonly networkStatusBoard: NetworkStatusBoard;
    private readonly slotList: SlotList;
    private readonly loadingContainer: HTMLDivElement;
    private readonly loadingInfo: HTMLDivElement;
    private readonly eventBus = EventBus.getInstance();
    private isChangingNetwork = false;
    private readonly validatorSummaryBoard: ValidatorSummaryBoard;
    private readonly validatorHighlightCircle: HTMLDivElement;
    private readonly paraSummaryBoard: ParaSummaryBoard;

    constructor(sceneDelegate: SceneDelegate) {
        this.root = <HTMLElement>document.getElementById('root');
        this.sceneContainer = <HTMLDivElement>document.getElementById('scene-container');
        this.background = <HTMLDivElement>document.getElementById('background');
        this.content = <HTMLDivElement>document.getElementById('content');
        this.leftPanel = <HTMLDivElement>document.getElementById('left-panel');
        this.mainLogoCanvas = <HTMLCanvasElement>document.getElementById('main-logo');
        this.logo = new Logo(getRandomShapeType(), getRandomCharacterType());
        this.xcmMessageList = new XCMMessageList();
        this.centerPanel = <HTMLDivElement>document.getElementById('center-panel');
        this.kusamaSelector = <HTMLDivElement>document.getElementById('kusama-selector');
        this.polkadotSelector = <HTMLDivElement>document.getElementById('polkadot-selector');
        this.rightPanel = <HTMLDivElement>document.getElementById('right-panel');
        this.networkStatusBoard = new NetworkStatusBoard();
        this.slotList = new SlotList();
        this.loadingContainer = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingInfo = <HTMLDivElement>document.getElementById('loading-info');
        this.validatorSummaryBoard = new ValidatorSummaryBoard();
        this.validatorHighlightCircle = <HTMLDivElement>(
            document.getElementById('validator-highlight-circle')
        );
        this.paraSummaryBoard = new ParaSummaryBoard();

        this.scene = new Scene(this.sceneContainer, sceneDelegate);
        this.kusamaSelector.addEventListener('click', (_event) => {
            if (this.isChangingNetwork) {
                return;
            }
            this.kusamaSelector.classList.add('active');
            this.polkadotSelector.classList.remove('active');
            this.selectNetwork(Kusama);
        });
        this.polkadotSelector.addEventListener('click', (_event) => {
            if (this.isChangingNetwork) {
                return;
            }
            this.kusamaSelector.classList.remove('active');
            this.polkadotSelector.classList.add('active');
            this.selectNetwork(Polkadot);
        });
    }

    init() {
        this.logo.draw(this.mainLogoCanvas, 0.6);
        this.animate();
    }

    displayLoading() {
        this.content.style.opacity = '0%';
        this.background.style.opacity = '0%';
    }

    animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        TWEEN.update();
        this.scene.animate();
    }

    setLoadingInfo(info: string) {
        this.loadingInfo.innerHTML = info;
    }

    private fadeOutLoadingContainer(onComplete: () => void) {
        const opacity = { opacity: 100 };
        createTween(
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
        ).start();
    }

    private fadeInLoadingContainer(onComplete: () => void) {
        this.loadingContainer.style.display = 'flex';
        const opacity = { opacity: 0 };
        createTween(
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
        ).start();
    }

    private fadeInBackground(onComplete: () => void) {
        this.background.style.opacity = '0%';
        show(this.background);
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 80 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.background.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeInContent(onComplete?: () => void) {
        this.content.style.opacity = '0%';
        show(this.content);
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.content.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeOutForNetworkChange(onComplete?: () => void) {
        const opacity = { opacity: 100 };
        createTween(
            opacity,
            { opacity: 0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.xcmMessageList.setOpacity(opacity.opacity);
                this.networkStatusBoard.setOpacity(opacity.opacity);
                this.slotList.setOpacity(opacity.opacity);
                this.sceneContainer.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeInAfterNetworkChange(onComplete?: () => void) {
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.xcmMessageList.setOpacity(opacity.opacity);
                this.networkStatusBoard.setOpacity(opacity.opacity);
                this.slotList.setOpacity(opacity.opacity);
                this.sceneContainer.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    start(
        slots: Slot[],
        paras: Para[],
        validatorMap: Map<string, ValidatorSummary>,
        onComplete?: () => void,
    ) {
        this.clearSlots();
        this.clearXCMMessages();
        this.fadeOutLoadingContainer(() => {
            if (this.isChangingNetwork) {
                this.slotList.initialize(slots);
                this.scene.start(paras, validatorMap);
                this.fadeInAfterNetworkChange(() => {
                    this.isChangingNetwork = false;
                    if (onComplete) {
                        onComplete();
                    }
                });
            } else {
                this.fadeInBackground(() => {
                    this.slotList.initialize(slots);
                    this.scene.start(paras, validatorMap);
                    this.fadeInContent(() => {
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

    private clearSlots() {
        this.slotList.initialize([]);
    }

    insertSlot(slot: Slot) {
        this.slotList.insertSlot(slot, true);
    }

    updateSlot(slot: Slot) {
        this.slotList.updateSlot(slot);
    }

    private clearXCMMessages() {
        this.xcmMessageList.clear();
    }

    insertXCMMessage(
        originExtrinsicHash: string,
        relayChain: Network,
        originPara: Para | undefined,
        destinationPara: Para | undefined,
    ) {
        this.xcmMessageList.insertMessage(
            originExtrinsicHash,
            relayChain,
            originPara,
            destinationPara,
        );
    }

    private selectNetwork(network: Network) {
        this.eventBus.dispatch<Network>(ChainvizEvent.NETWORK_SELECTED, network);
    }

    showValidatorSummaryBoard(
        network: Network,
        validatorSummary: ValidatorSummary,
        position: Vec2,
    ) {
        this.validatorSummaryBoard.show(network, validatorSummary);
        this.validatorSummaryBoard.setPosition(
            position.x + this.sceneContainer.getBoundingClientRect().left,
            position.y + this.sceneContainer.getBoundingClientRect().top,
        );
    }

    hideValidatorSummaryBoard() {
        this.validatorSummaryBoard.hide();
    }

    showValidatorHighlightCircle(position: Vec2) {
        const x = this.sceneContainer.getBoundingClientRect().left + position.x - 10.5;
        const y = this.sceneContainer.getBoundingClientRect().top + position.y - 10.5;
        this.validatorHighlightCircle.style.left = `${x}px`;
        this.validatorHighlightCircle.style.top = `${y}px`;
        this.validatorHighlightCircle.style.display = 'block';
    }

    hideValidatorHighlightCircle() {
        this.validatorHighlightCircle.style.display = 'none';
    }

    highlightValidator(network: Network, index: number, validator: ValidatorSummary) {
        const position = this.scene.getValidatorOnScreenPosition(validator.address);
        if (position != undefined) {
            this.scene.highlightValidator(index, validator);
            this.showValidatorSummaryBoard(network, cloneJSONSafeObject(validator), position);
            this.showValidatorHighlightCircle(position);
        }
    }

    clearValidatorHighlight() {
        this.scene.clearValidatorHighlight();
        this.hideValidatorSummaryBoard();
        this.hideValidatorHighlightCircle();
    }

    highlightPara(para: Para, paraValidatorStashAdresses: string[]) {
        this.scene.highlightPara(para.paraId, paraValidatorStashAdresses);
        const position = this.scene.getParaOnScreenPosition(para.paraId);
        this.showParaSummaryBoard(para, paraValidatorStashAdresses.length, position);
    }

    clearParaHighlight() {
        this.scene.clearParaHighlight();
        this.hideParaSummaryBoard();
    }

    showParaSummaryBoard(para: Para, paraValidatorCount: number, position: Vec2) {
        this.paraSummaryBoard.show(para, paraValidatorCount);
        this.paraSummaryBoard.setPosition(
            position.x + this.sceneContainer.getBoundingClientRect().left,
            position.y + this.sceneContainer.getBoundingClientRect().top,
        );
    }

    hideParaSummaryBoard() {
        this.paraSummaryBoard.hide();
    }
}

export { UI };
