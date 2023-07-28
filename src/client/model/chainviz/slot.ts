import { Block } from './block';

class Slot {
    readonly number: number;
    private isFinalized: boolean;
    private blocks: Block[];
    private readonly expandedBlockHashes: string[] = [];

    constructor(number: number, isFinalized: boolean, blocks: Block[]) {
        this.number = number;
        this.isFinalized = isFinalized;
        this.blocks = blocks;
    }

    getBlocks(): Block[] {
        return this.blocks;
    }

    getIsFinalized(): boolean {
        return this.isFinalized;
    }

    insertBlock(block: Block) {
        const existingBlocks = this.blocks.filter(function (existingBlock: Block) {
            return block.block.header.hash.toHex() == existingBlock.block.header.hash.toHex();
        });
        if (existingBlocks.length > 0) {
            return;
        }
        this.blocks.push(block);
    }

    finalize(block: Block) {
        this.blocks = [block];
        this.isFinalized = true;
    }

    toggleBlockExpand(hash: string) {
        const index = this.expandedBlockHashes.indexOf(hash);
        if (index >= 0) {
            this.expandedBlockHashes.splice(index, 1);
        } else {
            this.expandedBlockHashes.push(hash);
        }
    }

    blockIsExpanded(hash: string): boolean {
        return this.expandedBlockHashes.indexOf(hash) >= 0;
    }
}

export { Slot };
