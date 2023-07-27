import { Block } from '@polkadot/types/interfaces';

class Slot {
    readonly number: number;
    private isFinalized: boolean;
    private blocks: Block[];

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
            return block.header.hash.toHex() == existingBlock.header.hash.toHex();
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
}

export { Slot };
