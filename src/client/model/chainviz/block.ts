import { Block as SubstrateBlock } from "@polkadot/types/interfaces";

class Block {
    readonly block: SubstrateBlock;
    readonly timestamp: number;

    constructor(
        block: SubstrateBlock,
        timestamp: number,
    ) {
        this.block = block;
        this.timestamp = timestamp;
    }
}

export { Block }