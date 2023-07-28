import { Block } from '../model/chainviz/block';
import { Slot } from '../model/chainviz/slot';
import { capitalize, getBlockTimeFormatted, getCondensedHash } from '../util/format';

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
        this.ui.root.innerHTML = '';
        for (const slot of slots) {
            this.insertSlot(slot, false);
        }
    }

    private getBlockHTML(slot: Slot, block: Block): string {
        const hash = block.block.header.hash.toHex();
        let html = `<div class="block" id="block-${hash}">`;
        html += '<div class="block-header">';
        html += `<span>${block.block.header.number.toNumber()}</span>`;
        html += '<span>|</span>';
        html += `<span class="hash">${getCondensedHash(hash, 11)}</span>`;
        html += '</div>';

        if (slot.blockIsExpanded(hash)) {
            html += '<div class="block-content-separator"></div>';
            // block time
            html += '<div class="block-content-row">';
            html += '<span>Timestamp</span>';
            html += `<span>${getBlockTimeFormatted(block.time)}</span>`;
            html += '</div>';
            // status
            html += '<div class="block-content-row">';
            html += '<span>Status</span>';
            html += `<span>${slot.getIsFinalized() ? 'Finalized' : 'Unfinalized'}</span>`;
            html += '</div>';
            // parent hash
            html += '<div class="block-content-row">';
            html += '<span>Parent Hash</span>';
            html += `<span class="hash">${getCondensedHash(
                block.block.header.parentHash.toHex(),
                9,
            )}</span>`;
            html += '</div>';
            // state root
            html += '<div class="block-content-row">';
            html += '<span>State Root</span>';
            html += `<span class="hash">${getCondensedHash(
                block.block.header.stateRoot.toHex(),
                9,
            )}</span>`;
            html += '</div>';
            // extrinsics root
            html += '<div class="block-content-row">';
            html += '<span>Extrinsics Root</span>';
            html += `<span class="hash">${getCondensedHash(
                block.block.header.extrinsicsRoot.toHex(),
                9,
            )}</span>`;
            html += '</div>';
            // runtime
            html += '<div class="block-content-row">';
            html += '<span>Runtime</span>';
            html += `<span>${block.runtimeVersion}</span>`;
            html += '</div>';

            // extrinsics
            html += '<div class="block-content-separator"></div>';
            html += '<div class="block-content-row">';
            html += `<span class="header">${block.block.extrinsics.length} Extrinsics</span>`;
            html += '</div>';
            for (const extrinsic of block.block.extrinsics) {
                html += '<div class="block-content-row">';
                html += `<span>${capitalize(extrinsic.method.section)}.${capitalize(
                    extrinsic.method.method,
                )}</span>`;
                html += '</div>';
            }

            // events
            html += '<div class="block-content-separator"></div>';
            html += '<div class="block-content-row">';
            html += `<span class="header">${block.events.length} Events</span>`;
            html += '</div>';
            for (const blockEvent of block.events) {
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                const { _, event, _ } = blockEvent;
                html += '<div class="block-content-row">';
                html += `<span>${capitalize(event.section)}.${event.method}</span>`;
                html += '</div>';
            }
        }

        html += '</div>';
        return html;
    }

    private getSlotHTML(slot: Slot): string {
        let html = `<div class="slot ${
            slot.getIsFinalized() ? 'finalized' : 'non-finalized'
        }" id="slot-${slot.number}">`;
        for (const block of slot.getBlocks()) {
            html += this.getBlockHTML(slot, block);
        }
        html += '</div>';
        return html;
    }

    private setBlockOnClick(slot: Slot, block: Block) {
        setTimeout(() => {
            const hash = block.block.header.hash.toHex();
            const blockDiv = document.getElementById(`block-${hash}`);
            blockDiv?.addEventListener('click', (_event) => {
                slot.toggleBlockExpand(hash);
                this.updateSlot(slot);
            });
        }, 500);
    }

    insertSlot(slot: Slot, prepend: boolean) {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('slot');
        if (slot.getIsFinalized()) {
            slotDiv.classList.add('finalized');
        } else {
            slotDiv.classList.add('non-finalized');
        }
        slotDiv.id = `slot-${slot.number}`;
        let html = '';
        for (const block of slot.getBlocks()) {
            html += this.getBlockHTML(slot, block);
            this.setBlockOnClick(slot, block);
        }
        slotDiv.innerHTML = html;
        if (prepend && this.ui.root.firstChild) {
            this.ui.root.insertBefore(slotDiv, this.ui.root.firstChild);
        } else {
            this.ui.root.appendChild(slotDiv);
        }
    }

    updateSlot(slot: Slot) {
        const slotDiv = <HTMLDivElement>document.getElementById(`slot-${slot.number}`);
        if (!slotDiv) {
            return;
        }
        slotDiv.classList.remove('non-finalized');
        slotDiv.classList.remove('finalized');
        if (slot.getIsFinalized()) {
            slotDiv.classList.add('finalized');
        } else {
            slotDiv.classList.add('non-finalized');
        }
        let html = '';
        for (const block of slot.getBlocks()) {
            const blockDiv = <HTMLDivElement>(
                document.getElementById(`block-${block.block.header.hash.toHex()}`)
            );
            if (blockDiv) {
                blockDiv.parentNode!.removeChild(blockDiv);
            }
            html += this.getBlockHTML(slot, block);
            this.setBlockOnClick(slot, block);
        }
        slotDiv.innerHTML = html;
    }
}

export { SlotList };
