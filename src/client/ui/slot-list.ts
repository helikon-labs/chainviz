import { Slot } from '../model/slot';

interface UI {
    root: HTMLElement;
}

class SlotList {
    private readonly ui: UI;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('slot-list'),
        };
    }

    display(slots: Slot[]) {
        let html = '';
        for (const slot of slots) {
            html += this.getSlotInnerHTML(slot);
        }
        this.ui.root.innerHTML = html;
    }

    private getSlotInnerHTML(slot: Slot): string {
        let html = `<div class="slot ${
            slot.getIsFinalized() ? 'finalized' : 'non-finalized'
        }" id="slot-${slot.number}">`;
        for (const block of slot.getBlocks()) {
            const hash = block.header.hash.toHex();
            let blockHTML = `<div class="block" id="block-${hash}">`;
            blockHTML += `<span>${slot.number}</span>`;
            blockHTML += '<span>|</span>';
            blockHTML += `<span class="hash">${hash.slice(0, 11)}...${hash.slice(-11)}</span>`;
            blockHTML += '</div>';
            html += blockHTML;
        }
        html += '</div>';
        return html;
    }
}

export { SlotList };
