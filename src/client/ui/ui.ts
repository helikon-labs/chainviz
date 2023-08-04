import { Slot } from '../model/chainviz/slot';
import { Kusama, Network, Polkadot } from '../model/substrate/network';
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
import { Chainviz3DScene } from '../scene/scene';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { EventBus } from '../event/event-bus';
import { ChainvizEvent } from '../event/event';

class UI {
    private readonly scene: Chainviz3DScene;
    private readonly root: HTMLElement;
    private readonly sceneContainer: HTMLDivElement;
    private readonly sceneDiv: HTMLDivElement;
    private readonly background: HTMLDivElement;
    private readonly leftPanel: HTMLDivElement;
    private readonly kusamaSelector: HTMLDivElement;
    private readonly polkadotSelector: HTMLDivElement;
    private readonly rightPanel: HTMLDivElement;
    private readonly mainLogoCanvas: HTMLCanvasElement;
    private readonly loadingContainer: HTMLDivElement;
    private readonly loadingInfo: HTMLDivElement;
    private readonly logo: Logo;
    private readonly networkStatusBoard: NetworkStatusBoard;
    private readonly slotList: SlotList;
    private readonly xcmMessageList: XCMMessageList;
    private readonly eventBus = EventBus.getInstance();

    constructor() {
        this.root = <HTMLElement>document.getElementById('root');
        this.sceneContainer = <HTMLDivElement>document.getElementById('scene-container');
        this.sceneDiv = <HTMLDivElement>document.getElementById('scene');
        this.background = <HTMLDivElement>document.getElementById('background');
        this.leftPanel = <HTMLDivElement>document.getElementById('left-panel');
        this.kusamaSelector = <HTMLDivElement>document.getElementById('kusama-selector');
        this.polkadotSelector = <HTMLDivElement>document.getElementById('polkadot-selector');
        this.rightPanel = <HTMLDivElement>document.getElementById('right-panel');
        this.mainLogoCanvas = <HTMLCanvasElement>document.getElementById('main-logo');
        this.loadingContainer = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingInfo = <HTMLDivElement>document.getElementById('loading-info');
        this.logo = new Logo(getRandomShapeType(), getRandomCharacterType());
        this.networkStatusBoard = new NetworkStatusBoard();
        this.slotList = new SlotList();
        this.xcmMessageList = new XCMMessageList();

        this.scene = new Chainviz3DScene(this.sceneDiv);

        this.background.style.opacity = '0%';

        this.kusamaSelector.addEventListener('click', (_event) => {
            this.kusamaSelector.classList.add('active');
            this.polkadotSelector.classList.remove('active');
            this.selectNetwork(Kusama);
        });
        this.polkadotSelector.addEventListener('click', (_event) => {
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
        hide(this.background);
        hide(this.leftPanel);
        hide(this.rightPanel);
        hide(this.sceneContainer);
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

    private fadeInLeftPanel(onComplete?: () => void) {
        this.leftPanel.style.opacity = '0%';
        show(this.leftPanel);
        const opacity = { opacity: 0 };
        createTween(
            opacity,
            { opacity: 100 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
                this.leftPanel.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeInRightPanel(onComplete: () => void) {
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
                this.rightPanel.style.opacity = `${opacity.opacity}%`;
            },
            onComplete,
        ).start();
    }

    private fadeOutRightPanel(onComplete: () => void) {
        const opacity = { opacity: 100 };
        createTween(
            opacity,
            { opacity: 0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
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

    private fadeOutSceneContainer(onComplete: () => void) {
        const opacity = { opacity: 100 };
        createTween(
            opacity,
            { opacity: 0 },
            TWEEN.Easing.Exponential.InOut,
            Constants.CONTENT_FADE_ANIM_DURATION_MS,
            undefined,
            () => {
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
        this.fadeOutLoadingContainer(() => {
            this.fadeInBackground(() => {
                this.fadeInLeftPanel();
                this.fadeInRightPanel(() => {
                    this.scene.start(paras, validatorMap);
                    this.fadeInSceneContainer(() => {
                        this.slotList.initialize(slots);
                        if (onComplete) {
                            onComplete();
                        }
                    });
                });
            });
        });
    }

    reset(onComplete?: () => void) {
        this.clearXCMMessages();
        this.scene.reset(() => {
            this.fadeOutSceneContainer(() => {
                this.fadeOutRightPanel(() => {
                    this.fadeInLoadingContainer(() => {
                        if (onComplete) {
                            onComplete();
                        }
                    });
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
}

export { UI };
