import { Para } from '../model/substrate/para';
import { Constants } from '../util/constants';

interface UI {
    root: HTMLElement;
    nameAndId: HTMLElement;
    paravalidatorCount: HTMLElement;
}

class ParaSummaryBoard {
    private readonly ui: UI;
    private para?: Para = undefined;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('para-summary-board'),
            nameAndId: <HTMLElement>document.getElementById('para-summary-name-and-id'),
            paravalidatorCount: <HTMLElement>(
                document.getElementById('para-summary-para-validator-count')
            ),
        };
    }

    show(para: Para, paravalidatorCount: number) {
        this.para = para;
        this.ui.nameAndId.innerHTML = `${para.text} (#${para.paraId})`;
        this.ui.paravalidatorCount.innerHTML = `${paravalidatorCount} paravalidators`;
        this.ui.root.style.visibility = 'visible';
    }

    setPosition(x: number, y: number) {
        this.ui.root.style.left = `${x + Constants.PARA_SUMMARY_BOARD_X_OFFSET}px`;
        this.ui.root.style.top = `${y + Constants.PARA_SUMMARY_INFO_BOARD_Y_OFFSET}px`;
    }

    hide() {
        this.ui.root.style.visibility = 'hidden';
        this.para = undefined;
    }
}

export { ParaSummaryBoard };
