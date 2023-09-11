import { KUSAMA_PARAS } from '../../data/kusama-paras';
import { POLKADOT_PARAS } from '../../data/polkadot-paras';
import { Constants } from '../../util/constants';
import { Para } from './para';

/**
 * Substrate network.
 */
interface Network {
    readonly id: string;
    readonly display: string;
    readonly tokenTicker: string;
    readonly tokenDecimals: number;
    readonly ss58Prefix: number;
    readonly logo: string;
    readonly paras: Para[];
    readonly rpcURL: string;
    readonly networkStatusServiceURL: string;
    readonly activeValidatorListServiceURL: string;
}

const Kusama = {
    id: 'kusama',
    display: 'Kusama',
    tokenTicker: 'KSM',
    tokenDecimals: 12,
    ss58Prefix: 2,
    logo: 'kusama.svg',
    paras: KUSAMA_PARAS,
    rpcURL: Constants.KUSAMA_RPC_URL,
    //rpcURL: 'wss://kusama-rpc.polkadot.io',
    networkStatusServiceURL: 'wss://rpc.kusama.subvt.io:17888',
    activeValidatorListServiceURL: 'wss://rpc.kusama.subvt.io:17889',
} as Network;

const Polkadot = {
    id: 'polkadot',
    display: 'Polkadot',
    tokenTicker: 'DOT',
    tokenDecimals: 10,
    ss58Prefix: 0,
    logo: 'polkadot-circle.svg',
    paras: POLKADOT_PARAS,
    rpcURL: Constants.POLKADOT_RPC_URL,
    //rpcURL: 'wss://rpc.polkadot.io',
    networkStatusServiceURL: 'wss://rpc.polkadot.subvt.io:18888',
    activeValidatorListServiceURL: 'wss://rpc.polkadot.subvt.io:18889',
} as Network;

function getNetworkPara(network: Network, paraId: number): Para | undefined {
    return network.paras.find((para) => para.paraId == paraId);
}

export { Network, Kusama, Polkadot, getNetworkPara };
