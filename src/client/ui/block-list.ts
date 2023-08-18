import { Block } from '../model/chainviz/block';
import { Constants } from '../util/constants';
import {
    capitalize,
    getBlockTimeFormatted,
    getCondensedAddress,
    getCondensedHash,
} from '../util/format';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

interface UI {
    root: HTMLElement;
}

class BlockList {
    private readonly ui: UI;
    private readonly isCandidateBlockList: boolean;
    private expandedBlockHashes: string[] = [];

    constructor(divId: string, isCandidateBlockList: boolean) {
        this.ui = {
            root: <HTMLElement>document.getElementById(divId),
        };
        this.isCandidateBlockList = isCandidateBlockList;
    }

    initialize(blocks: Block[]) {
        this.ui.root.innerHTML = '';
        for (const block of blocks) {
            this.insertBlock(block);
        }
    }

    setOpacity(opacity: number) {
        this.ui.root.style.opacity = `${opacity}%`;
    }

    private getBlockHTML(block: Block): string {
        const hash = block.block.header.hash.toHex();
        let html = '<div class="block-header">';
        html += `<span>${block.block.header.number.toNumber()}</span>`;
        html += '<span>|</span>';
        html += `<span class="hash">${getCondensedHash(hash, 11)}</span>`;
        html += '</div>';

        if (
            this.expandedBlockHashes.findIndex((expandedBlockHash) => expandedBlockHash == hash) >=
            0
        ) {
            html += '<div class="block-content-separator"></div>';
            // block time
            html += '<div class="block-content-row">';
            html += '<span>Timestamp</span>';
            html += `<span>${getBlockTimeFormatted(block.time)}</span>`;
            html += '</div>';
            // author
            const authorDisplay = block.getAuthorDisplay();
            if (authorDisplay) {
                html += '<div class="block-content-row">';
                html += '<span>Author</span>';
                html += `<span>${block.getAuthorIdentityIconHTML()}${authorDisplay}</span>`;
                html += '</div>';
            } else if (block.authorAccountId) {
                html += '<div class="block-content-row">';
                html += '<span>Author</span>';
                html += `<span>${getCondensedAddress(block.authorAccountId.toString())}</span>`;
                html += '</div>';
            }
            // status
            html += '<div class="block-content-row">';
            html += '<span>Status</span>';
            html += `<span>${block.isFinalized ? 'Finalized' : 'Unfinalized'}</span>`;
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
                const { _phase, event, _topics } = blockEvent;
                html += '<div class="block-content-row">';
                html += `<span>${capitalize(event.section)}.${event.method}</span>`;
                html += '</div>';
            }
        }
        return html;
    }

    private setBlockOnClick(block: Block) {
        setTimeout(() => {
            const hash = block.block.header.hash.toHex();
            const blockDiv = document.getElementById(`block-${hash}`);
            blockDiv?.addEventListener('click', (_event) => {
                this.toggleBlockExpand(hash);
                this.updateBlockDiv(block);
            });
        }, 500);
    }

    private toggleBlockExpand(hash: string) {
        const index = this.expandedBlockHashes.indexOf(hash);
        if (index >= 0) {
            this.expandedBlockHashes.splice(index, 1);
        } else {
            this.expandedBlockHashes.push(hash);
        }
    }

    private updateBlockDiv(block: Block) {
        const blockDiv = this.getBlockDiv(block);
        if (!blockDiv) {
            return;
        }
        blockDiv.classList.remove('non-finalized');
        blockDiv.classList.remove('finalized');
        if (block.isFinalized) {
            blockDiv.classList.add('finalized');
        } else {
            blockDiv.classList.add('non-finalized');
        }
        // this.setBlockOnClick(block);
        blockDiv.innerHTML = this.getBlockHTML(block);
    }

    private insertBlock(block: Block) {
        const newBlockNumber = block.block.header.number.toNumber();
        let nextBlockDiv: Element | undefined = undefined;
        for (const blockDiv of this.ui.root.children) {
            const blockNumber = Number(blockDiv.getAttribute('block-number')!);
            if (newBlockNumber >= blockNumber) {
                nextBlockDiv = blockDiv;
                break;
            }
        }
        const newBlockDiv = document.createElement('div');
        const hash = block.block.header.hash.toHex();
        newBlockDiv.id = `${this.isCandidateBlockList ? 'candidate-' : ''}block-${hash}`;
        newBlockDiv.setAttribute('block-number', block.block.header.number.toNumber().toString());
        newBlockDiv.classList.add('block');
        if (this.isCandidateBlockList) {
            newBlockDiv.classList.add('candidate');
            newBlockDiv.classList.add('transparent');
        } else if (block.isFinalized) {
            newBlockDiv.classList.add('finalized');
        } else {
            newBlockDiv.classList.add('non-finalized');
        }
        newBlockDiv.innerHTML = this.getBlockHTML(block);
        if (nextBlockDiv == undefined || this.isCandidateBlockList) {
            this.ui.root.appendChild(newBlockDiv);
        } else {
            this.ui.root.insertBefore(newBlockDiv, nextBlockDiv);
        }
        if (!this.isCandidateBlockList) {
            this.setBlockOnClick(block);
        }
    }

    onNewBlock(block: Block) {
        this.insertBlock(block);
    }

    showBlock(block: Block) {
        const blockDiv = this.getBlockDiv(block);
        if (blockDiv) {
            blockDiv.classList.remove('transparent');
            blockDiv.style.opacity = '0%';
            const progress = { progress: 0 };
            createTween(
                progress,
                { progress: 100 },
                TWEEN.Easing.Quadratic.InOut,
                Constants.NEW_BLOCK_APPEAR_ANIM_DURATION_MS,
                undefined,
                () => {
                    blockDiv.style.opacity = `${progress.progress}%`;
                },
            ).start();
        }
    }

    onFinalizedBlock(block: Block) {
        const blockDiv = this.getBlockDiv(block);
        if (blockDiv) {
            this.updateBlockDiv(block);
        } else {
            this.insertBlock(block);
        }
    }

    onDiscardedBlock(block: Block) {
        const hash = block.block.header.hash.toHex();
        const blockDiv = this.getBlockDiv(block);
        if (blockDiv) {
            blockDiv.remove();
        }
        this.expandedBlockHashes = this.expandedBlockHashes.filter(
            (expandedBlockHash) => expandedBlockHash != hash,
        );
        const explandedBlockHashesIndex = this.expandedBlockHashes.indexOf(hash);
        if (explandedBlockHashesIndex >= 0) {
            this.expandedBlockHashes.splice(explandedBlockHashesIndex, 1);
        }
    }

    private getBlockDiv(block: Block): HTMLDivElement {
        const hash = block.block.header.hash.toHex();
        return <HTMLDivElement>(
            document.getElementById(`${this.isCandidateBlockList ? 'candidate-' : ''}block-${hash}`)
        );
    }
}

export { BlockList };
