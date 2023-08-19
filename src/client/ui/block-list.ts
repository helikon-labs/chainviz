import { Block } from '../model/chainviz/block';
import { Constants } from '../util/constants';
import { getCondensedHash } from '../util/format';
import { createTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';
import { BlockDetailsBoard } from './block-details-board';

interface UI {
    root: HTMLElement;
}

class BlockList {
    private readonly ui: UI;
    private readonly isCandidateBlockList: boolean;
    private readonly blockDetailsBoard?: BlockDetailsBoard;

    constructor(divId: string, isCandidateBlockList: boolean) {
        this.ui = {
            root: <HTMLElement>document.getElementById(divId),
        };
        this.isCandidateBlockList = isCandidateBlockList;
        if (!isCandidateBlockList) {
            this.blockDetailsBoard = new BlockDetailsBoard();
        }
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
        return html;
    }

    private setBlockOnClick(block: Block) {
        setTimeout(() => {
            const hash = block.block.header.hash.toHex();
            const blockDiv = document.getElementById(`block-${hash}`);
            blockDiv?.addEventListener('click', (_event) => {
                this.blockDetailsBoard?.display(block);
            });
        }, 500);
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
        const blockDiv = this.getBlockDiv(block);
        if (blockDiv) {
            blockDiv.remove();
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
