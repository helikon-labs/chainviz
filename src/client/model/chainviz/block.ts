import { HeaderExtended } from '@polkadot/api-derive/types';
import { AccountId, Block as SubstrateBlock } from '@polkadot/types/interfaces';
import { AnyJson } from '@polkadot/types/types';

/**
 * App-level block type definition.
 */
class Block {
    /**
     * To extract block author.
     */
    readonly extendedHeader: HeaderExtended;
    /**
     * Actual Substrate block.
     */
    readonly block: SubstrateBlock;
    /**
     * Account id of the author.
     */
    readonly authorAccountId?: AccountId;
    /**
     * Pre-calculated author display.
     */
    private authorDisplay?: string;
    private authorIdentityIconHTML?: string;
    /**
     * Block time.
     */
    readonly time: Date;
    /**
     * Events in the block.
     */
    readonly events: AnyJson[];
    /**
     * Block runtime version.
     */
    readonly runtimeVersion: number;
    /**
     * Whether the block is finalized.
     */
    isFinalized: boolean = false;

    constructor(
        extendedHeader: HeaderExtended,
        block: SubstrateBlock,
        timestampMs: number,
        events: AnyJson[],
        runtimeVersion: number,
    ) {
        this.extendedHeader = extendedHeader;
        this.authorAccountId = extendedHeader.author;
        this.block = block;
        this.time = new Date(timestampMs);
        this.events = events;
        this.runtimeVersion = runtimeVersion;
    }

    setAuthorDisplay(display: string) {
        this.authorDisplay = display;
    }

    getAuthorDisplay(): string | undefined {
        return this.authorDisplay;
    }

    setAuthorIdentityIconHTML(html: string) {
        this.authorIdentityIconHTML = html;
    }

    getAuthorIdentityIconHTML(): string | undefined {
        return this.authorIdentityIconHTML;
    }
}

export { Block };
