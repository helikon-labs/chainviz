import { Slot } from '../model/slot';
import { Network } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { hide, show } from '../util/ui-util';
import { Logo, getRandomCharacterType, getRandomShapeType } from './logo';
import { NetworkStatusBoard } from './network-status-board';
import { SlotList } from './slot-list';

class UI {
    private readonly root: HTMLElement;
    private readonly leftPanel: HTMLDivElement;
    private readonly rightPanel: HTMLDivElement;
    private readonly mainLogoCanvas: HTMLCanvasElement;
    private readonly loadingContainer: HTMLDivElement;
    private readonly loadingLogoCanvas: HTMLCanvasElement;
    private readonly loadingInfo: HTMLDivElement;
    private readonly logo: Logo;
    private readonly networkStatusBoard: NetworkStatusBoard;
    private readonly slotList: SlotList;

    constructor() {
        this.root = <HTMLElement>document.getElementById('root');
        this.leftPanel = <HTMLDivElement>document.getElementById('left-panel');
        this.rightPanel = <HTMLDivElement>document.getElementById('right-panel');
        this.mainLogoCanvas = <HTMLCanvasElement>document.getElementById('main-logo');
        this.loadingContainer = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingLogoCanvas = <HTMLCanvasElement>document.getElementById('loading-logo');
        this.loadingInfo = <HTMLDivElement>document.getElementById('loading-info');
        this.logo = new Logo(getRandomShapeType(), getRandomCharacterType());
        this.networkStatusBoard = new NetworkStatusBoard();
        this.slotList = new SlotList();
    }

    init() {
        this.logo.draw(this.mainLogoCanvas, 0.6);
        this.logo.draw(this.loadingLogoCanvas, 1);
    }

    displayLoading() {
        hide(this.leftPanel);
        hide(this.rightPanel);
    }

    setLoadingInfo(info: string) {
        this.loadingInfo.innerHTML = info;
    }

    start() {
        hide(this.loadingContainer);
        show(this.leftPanel);
        show(this.rightPanel);
    }

    displayNetworkStatus(network: Network, status: NetworkStatus) {
        this.networkStatusBoard.display(network, status);
    }

    displaySlots(slots: Slot[]) {
        this.slotList.display(slots);
    }
}

export { UI };
