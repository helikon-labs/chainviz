import { Block } from '@polkadot/types/interfaces';
import { Slot } from '../model/chainviz/slot';

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

    initialize(slots: Slot[]) {
        let html = '';
        for (const slot of slots) {
            html += this.getSlotHTML(slot);
        }
        this.ui.root.innerHTML = html;
    }

    private getBlockHTML(block: Block): string {
        const hash = block.header.hash.toHex();
        let html = `<div class="block" id="block-${hash}">`;
        html += `<span>${block.header.number.toNumber()}</span>`;
        html += '<span>|</span>';
        html += `<span class="hash">${hash.slice(0, 11)}...${hash.slice(-11)}</span>`;
        html += '</div>';
        return html;
    }

    private getSlotHTML(slot: Slot): string {
        let html = `<div class="slot ${
            slot.getIsFinalized() ? 'finalized' : 'non-finalized'
        }" id="slot-${slot.number}">`;
        for (const block of slot.getBlocks()) {
            html += this.getBlockHTML(block);
        }
        html += '</div>';
        return html;
    }

    insertSlot(slot: Slot) {
        let slotDiv = document.createElement('div');
        slotDiv.classList.add('slot');
        if (slot.getIsFinalized()) {
            slotDiv.classList.add('finalized');
        } else {
            slotDiv.classList.add('non-finalized');
        }
        slotDiv.id = `slot-${slot.number}`;
        let html = '';
        for (const block of slot.getBlocks()) {
            html += this.getBlockHTML(block);
        }
        slotDiv.innerHTML = html;
        this.ui.root.insertBefore(slotDiv, this.ui.root.firstChild);
    }

    updateSlot(slot: Slot) {
        let slotDiv = <HTMLDivElement>document.getElementById(`slot-${slot.number}`);
        if (!slotDiv) { return; }
        slotDiv.classList.remove('non-finalized');
        slotDiv.classList.remove('finalized');
        if (slot.getIsFinalized()) {
            slotDiv.classList.add('finalized');
        } else {
            slotDiv.classList.add('non-finalized');
        }
        let html = '';
        for (const block of slot.getBlocks()) {
            html += this.getBlockHTML(block);
        }
        slotDiv.innerHTML = html;
    }
}

export { SlotList };
