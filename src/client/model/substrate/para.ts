import { AnyJson } from '@polkadot/types/types';

export interface ParaUI {
    color?: string;
    logo: string;
}

export interface Para {
    homepage?: string;
    info: string;
    isUnreachable?: boolean;
    paraId: number;
    text: string;
    providers: AnyJson;
    ui: ParaUI;
}
