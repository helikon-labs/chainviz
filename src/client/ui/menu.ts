interface UI {
    root: HTMLElement;
    mainItem: HTMLElement;
    mainContent: HTMLElement;
    validatorsItem: HTMLElement;
    validatorsContent: HTMLElement;
    aboutItem: HTMLElement;
    aboutContent: HTMLElement;
}

enum MenuItem {
    Main,
    Validators,
    About,
}

class Menu {
    private readonly ui: UI;
    private currentItem: MenuItem = MenuItem.Main;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('menu'),
            mainItem: <HTMLElement>document.getElementById('menu-item-main'),
            mainContent: <HTMLElement>document.getElementById('menu-content-main'),
            validatorsItem: <HTMLElement>document.getElementById('menu-item-validators'),
            validatorsContent: <HTMLElement>document.getElementById('menu-content-validators'),
            aboutItem: <HTMLElement>document.getElementById('menu-item-about'),
            aboutContent: <HTMLElement>document.getElementById('menu-content-about'),
        };
        setTimeout(() => {
            this.ui.mainItem.onclick = () => {
                this.select(MenuItem.Main);
            };
            this.ui.validatorsItem.onclick = () => {
                this.select(MenuItem.Validators);
            };
            this.ui.aboutItem.onclick = () => {
                this.select(MenuItem.About);
            };
        }, 500);
    }

    select(item: MenuItem) {
        if (item == this.currentItem) {
            return;
        }
        this.ui.mainItem.classList.remove('selected');
        if (!this.ui.mainContent.classList.contains('hidden')) {
            this.ui.mainContent.classList.add('hidden');
        }
        this.ui.validatorsItem.classList.remove('selected');
        if (!this.ui.validatorsContent.classList.contains('hidden')) {
            this.ui.validatorsContent.classList.add('hidden');
        }
        this.ui.aboutItem.classList.remove('selected');
        if (!this.ui.aboutContent.classList.contains('hidden')) {
            this.ui.aboutContent.classList.add('hidden');
        }
        switch (item) {
            case MenuItem.Main:
                this.ui.mainItem.classList.add('selected');
                this.ui.mainContent.classList.remove('hidden');
                break;
            case MenuItem.Validators:
                this.ui.validatorsItem.classList.add('selected');
                this.ui.validatorsContent.classList.remove('hidden');
                break;
            case MenuItem.About:
                this.ui.aboutItem.classList.add('selected');
                this.ui.aboutContent.classList.remove('hidden');
                break;
        }
        this.currentItem = item;
    }

    setOpacity(opacity: number) {
        this.ui.root.style.opacity = `${opacity}%`;
    }

    getCurrentItem(): MenuItem {
        return this.currentItem;
    }
}

export { Menu, MenuItem };
