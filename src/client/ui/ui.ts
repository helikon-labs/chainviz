import { Slot } from '../model/chainviz/slot';
import { Network } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { Constants } from '../util/constants';
import { createTween } from '../util/tween';
import { hide, show } from '../util/ui-util';
import { Logo, getRandomCharacterType, getRandomShapeType } from './logo';
import { NetworkStatusBoard } from './network-status-board';
import { SlotList } from './slot-list';
import * as TWEEN from '@tweenjs/tween.js';
import { XCMMessageList } from './xcm-message-list';
import { Para } from '../model/substrate/para';

class UI {
    private readonly root: HTMLElement;
    private readonly sceneContainer: HTMLDivElement;
    readonly scene: HTMLDivElement;
    private readonly background: HTMLDivElement;
    private readonly leftPanel: HTMLDivElement;
    private readonly rightPanel: HTMLDivElement;
    private readonly mainLogoCanvas: HTMLCanvasElement;
    private readonly loadingContainer: HTMLDivElement;
    private readonly loadingInfo: HTMLDivElement;
    private readonly logo: Logo;
    private readonly networkStatusBoard: NetworkStatusBoard;
    private readonly slotList: SlotList;
    private readonly xcmMessageList: XCMMessageList;

    constructor() {
        this.root = <HTMLElement>document.getElementById('root');
        this.sceneContainer = <HTMLDivElement>document.getElementById('scene-container');
        this.scene = <HTMLDivElement>document.getElementById('scene');
        this.background = <HTMLDivElement>document.getElementById('background');
        this.leftPanel = <HTMLDivElement>document.getElementById('left-panel');
        this.rightPanel = <HTMLDivElement>document.getElementById('right-panel');
        this.mainLogoCanvas = <HTMLCanvasElement>document.getElementById('main-logo');
        this.loadingContainer = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingInfo = <HTMLDivElement>document.getElementById('loading-info');
        this.logo = new Logo(getRandomShapeType(), getRandomCharacterType());
        this.networkStatusBoard = new NetworkStatusBoard();
        this.slotList = new SlotList();
        this.xcmMessageList = new XCMMessageList();
    }

    init() {
        this.logo.draw(this.mainLogoCanvas, 0.6);
    }

    displayLoading() {
        hide(this.background);
        hide(this.leftPanel);
        hide(this.rightPanel);
        hide(this.sceneContainer);
    }

    setLoadingInfo(info: string) {
        this.loadingInfo.innerHTML = info;
    }

    start(onComplete?: () => void) {
        this.fadeOutLoadingContainer(() => {
            this.fadeInBackground(() => {
                this.fadeInContent(() => {
                    this.fadeInSceneContainer(() => {
                        if (onComplete) {
                            onComplete();
                        }
                    });
                });
            });
        });
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
                this.loadingContainer.parentNode?.removeChild(this.loadingContainer);
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
            { opacity: 30 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.background.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeInContent(onComplete: () => void) {
        this.leftPanel.style.opacity = '0%';
        show(this.leftPanel);
        this.rightPanel.style.opacity = '0%';
        show(this.rightPanel);
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.leftPanel.style.opacity = `${opacity.opacity}%`;
                this.rightPanel.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeInSceneContainer(onComplete: () => void) {
        this.sceneContainer.style.opacity = '0%';
        show(this.sceneContainer);
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.sceneContainer.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    displayNetworkStatus(network: Network, status: NetworkStatus) {
        this.networkStatusBoard.display(network, status);
    }

    initializeSlots(slots: Slot[]) {
        this.slotList.initialize(slots);
    }

    insertSlot(slot: Slot) {
        this.slotList.insertSlot(slot, true);
    }

    updateSlot(slot: Slot) {
        this.slotList.updateSlot(slot);
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
}

export { UI };
