import { Block } from '../model/chainviz/block';
import { Constants } from '../util/constants';
import {
    capitalize,
    getBlockTimeFormatted,
    getCondensedAddress,
    getCondensedHash,
} from '../util/format';
import { hide, show } from '../util/ui-util';

interface UI {
    root: HTMLElement;
    close: HTMLElement;
    number: HTMLElement;
    timestamp: HTMLElement;
    status: HTMLElement;
    hash: HTMLElement;
    parentHash: HTMLElement;
    stateRoot: HTMLElement;
    extrinsicsRoot: HTMLElement;
    author: HTMLElement;
    runtime: HTMLElement;
    extrinsicCount: HTMLElement;
    extrinsicsChevron: HTMLElement;
    extrinsicContainer: HTMLElement;
    eventCount: HTMLElement;
    eventsChevron: HTMLElement;
    eventContainer: HTMLElement;
}

class BlockDetailsBoard {
    private readonly ui: UI;
    private extrinsicsAreVisible: boolean = false;
    private eventsAreVisible: boolean = false;
    private hash: string = '';

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('block-details-board'),
            close: <HTMLElement>document.getElementById('block-details-close'),
            number: <HTMLElement>document.getElementById('block-details-number'),
            timestamp: <HTMLElement>document.getElementById('block-details-timestamp'),
            status: <HTMLElement>document.getElementById('block-details-status'),
            hash: <HTMLElement>document.getElementById('block-details-hash'),
            parentHash: <HTMLElement>document.getElementById('block-details-parent-hash'),
            stateRoot: <HTMLElement>document.getElementById('block-details-state-root'),
            extrinsicsRoot: <HTMLElement>document.getElementById('block-details-extrinsics-root'),
            author: <HTMLElement>document.getElementById('block-details-author'),
            runtime: <HTMLElement>document.getElementById('block-details-runtime'),
            extrinsicCount: <HTMLElement>document.getElementById('block-details-extrinsic-count'),
            extrinsicsChevron: <HTMLElement>(
                document.getElementById('block-details-extrinsics-chevron')
            ),
            extrinsicContainer: <HTMLElement>(
                document.getElementById('block-details-extrinsic-container')
            ),
            eventCount: <HTMLElement>document.getElementById('block-details-event-count'),
            eventsChevron: <HTMLElement>document.getElementById('block-details-events-chevron'),
            eventContainer: <HTMLElement>document.getElementById('block-details-event-container'),
        };
        setTimeout(() => {
            this.ui.close.addEventListener('click', (_event) => {
                this.close();
            });
            this.ui.extrinsicCount.parentElement!.addEventListener('click', (_event) => {
                if (this.extrinsicsAreVisible) {
                    this.hideExtrinsics();
                } else {
                    this.showExtrinsics();
                }
            });
            this.ui.eventCount.parentElement!.addEventListener('click', (_event) => {
                if (this.eventsAreVisible) {
                    this.hideEvents();
                } else {
                    this.showEvents();
                }
            });
        }, 500);
    }

    private hideExtrinsics() {
        hide(this.ui.extrinsicContainer);
        this.ui.extrinsicsChevron.classList.remove('fa-chevron-down');
        this.ui.extrinsicsChevron.classList.add('fa-chevron-right');
        this.extrinsicsAreVisible = false;
    }

    private showExtrinsics() {
        show(this.ui.extrinsicContainer);
        this.ui.extrinsicsChevron.classList.remove('fa-chevron-right');
        this.ui.extrinsicsChevron.classList.add('fa-chevron-down');
        this.extrinsicsAreVisible = true;
    }

    private hideEvents() {
        hide(this.ui.eventContainer);
        this.ui.eventsChevron.classList.remove('fa-chevron-down');
        this.ui.eventsChevron.classList.add('fa-chevron-right');
        this.eventsAreVisible = false;
    }

    private showEvents() {
        show(this.ui.eventContainer);
        this.ui.eventsChevron.classList.remove('fa-chevron-right');
        this.ui.eventsChevron.classList.add('fa-chevron-down');
        this.eventsAreVisible = true;
    }

    display(block: Block) {
        this.hash = block.block.header.hash.toHex();
        this.hideExtrinsics();
        this.hideEvents();
        this.ui.number.innerHTML = block.block.header.number.toNumber().toString();
        this.ui.timestamp.innerHTML = getBlockTimeFormatted(block.time);
        this.ui.status.innerHTML = block.isFinalized
            ? '<em class="fas fa-check-circle"></em>Finalized'
            : '<em class="fas fa-clock-o"></em>Non-finalized';
        this.ui.hash.innerHTML = getCondensedHash(
            block.block.header.hash.toHex(),
            Constants.HASH_TRIM_SIZE,
        );
        this.ui.parentHash.innerHTML = getCondensedHash(
            block.block.header.parentHash.toHex(),
            Constants.HASH_TRIM_SIZE,
        );
        this.ui.stateRoot.innerHTML = getCondensedHash(
            block.block.header.stateRoot.toHex(),
            Constants.HASH_TRIM_SIZE,
        );
        this.ui.extrinsicsRoot.innerHTML = getCondensedHash(
            block.block.header.extrinsicsRoot.toHex(),
            Constants.HASH_TRIM_SIZE,
        );
        const authorDisplay = block.getAuthorDisplay();
        if (authorDisplay) {
            this.ui.author.innerHTML = block.getAuthorIdentityIconHTML() + authorDisplay;
        } else if (block.authorAccountId) {
            this.ui.author.innerHTML = getCondensedAddress(block.authorAccountId.toString());
        }
        this.ui.runtime.innerHTML = block.runtimeVersion.toString();
        this.ui.extrinsicCount.innerHTML = `${block.block.extrinsics.length} EXTRINSICS`;
        let extrinsicListHTML = '';
        for (const extrinsic of block.block.extrinsics) {
            extrinsicListHTML += '<div class="block-details-row">';
            extrinsicListHTML += `${capitalize(extrinsic.method.section)}.${capitalize(
                extrinsic.method.method,
            )}`;
            extrinsicListHTML += '</div>';
        }
        // spacer
        extrinsicListHTML += '<div class="block-details-row"></div>';
        // searator
        extrinsicListHTML += '<div class="block-details-separator"></div>';
        this.ui.extrinsicContainer.innerHTML = extrinsicListHTML;

        this.ui.eventCount.innerHTML = `${block.events.length} EVENTS`;
        let eventListHTML = '';
        for (const blockEvent of block.events) {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            const { _phase, event, _topics } = blockEvent;
            eventListHTML += '<div class="block-details-row">';
            eventListHTML += `<span>${capitalize(event.section)}.${event.method}</span>`;
            eventListHTML += '</div>';
        }
        // spacer
        eventListHTML += '<div class="block-details-row"></div>';
        this.ui.eventContainer.innerHTML = eventListHTML;
        show(this.ui.root);
    }

    close() {
        hide(this.ui.root);
    }

    onFinalizedBlock(block: Block) {
        if (this.hash == block.block.header.hash.toHex()) {
            this.ui.status.innerHTML = '<em class="fas fa-check-circle"></em>Finalized';
        }
    }
}

export { BlockDetailsBoard };
