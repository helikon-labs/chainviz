import { Logo } from './logo';

class UI {
    private readonly root: HTMLElement;
    private readonly logo: Logo;

    constructor() {
        this.root = <HTMLElement>document.getElementById('network-status');
        this.logo = new Logo();
    }

    drawLogo() {
        this.logo.draw();
    }
}

export { UI };
