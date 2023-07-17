import { Logo, getRandomCharacterType, getRandomShapeType } from './logo';

class UI {
    private readonly root: HTMLElement;
    private readonly mainLogoCanvas: HTMLCanvasElement;
    private readonly loadingLogoCanvas: HTMLCanvasElement;
    private readonly logo: Logo;

    constructor() {
        this.root = <HTMLElement>document.getElementById('network-status');
        this.mainLogoCanvas = <HTMLCanvasElement>document.getElementById('main-logo');
        this.loadingLogoCanvas = <HTMLCanvasElement>document.getElementById('logo-anim');
        this.logo = new Logo(getRandomShapeType(), getRandomCharacterType());
    }

    drawLogo() {
        this.logo.draw(this.mainLogoCanvas, 0.6);
        this.logo.draw(this.loadingLogoCanvas, 1);
    }
}

export { UI };
