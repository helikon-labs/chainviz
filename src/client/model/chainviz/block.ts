import { Block as SubstrateBlock } from '@polkadot/types/interfaces';
import { AnyJson } from '@polkadot/types/types';

class Block {
    readonly block: SubstrateBlock;
    readonly time: Date;
    readonly events: AnyJson[];
    readonly runtimeVersion: number;

    constructor(
        block: SubstrateBlock,
        timestampMs: number,
        events: AnyJson[],
        runtimeVersion: number,
    ) {
        this.block = block;
        this.time = new Date(timestampMs);
        this.events = events;
        this.runtimeVersion = runtimeVersion;
    }
}

export { Block };
