import { KUSAMA_PARAS } from '../../data/kusama-paras';
import { POLKADOT_PARAS } from '../../data/polkadot-paras';
import { Para } from './para';

interface Network {
    readonly display: string;
    readonly tokenTicker: string;
    readonly tokenDecimals: number;
    readonly ss58Prefix: number;
    readonly rpcURL: string;
    readonly networkStatusServiceURL: string;
    readonly activeValidatorListServiceURL: string;
    readonly paras: Para[];
}

const Kusama = {
    display: 'Kusama',
    tokenTicker: 'KSM',
    tokenDecimals: 12,
    ss58Prefix: 2,
    rpcURL: 'wss://rpc.dotters.network/kusama',
    networkStatusServiceURL: 'wss://rpc.kusama.subvt.io:17888',
    activeValidatorListServiceURL: 'wss://rpc.kusama.subvt.io:17889',
    paras: KUSAMA_PARAS,
} as Network;

const Polkadot = {
    display: 'Polkadot',
    tokenTicker: 'DOT',
    tokenDecimals: 10,
    ss58Prefix: 0,
    rpcURL: 'wss://rpc.dotters.network/polkadot',
    networkStatusServiceURL: 'wss://rpc.polkadot.subvt.io:18888',
    activeValidatorListServiceURL: 'wss://rpc.polkadot.subvt.io:18889',
    paras: POLKADOT_PARAS,
} as Network;

export { Network, Kusama, Polkadot };
