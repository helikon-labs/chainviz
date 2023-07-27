import { Block } from '@polkadot/types/interfaces';

class Slot {
    private readonly number: number;
    private isFinalized: boolean;
    private readonly blocks: Block[];

    constructor(number: number, isFinalized: boolean, blocks: Block[]) {
        this.number = number;
        this.isFinalized = isFinalized;
        this.blocks = blocks;
    }
}

export { Slot };
