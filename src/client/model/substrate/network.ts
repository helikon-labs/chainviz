interface Network {
    readonly display: string;
    readonly tokenTicker: string;
    readonly tokenDecimals: number;
    readonly rpcURL: string;
    readonly networkStatusServiceURL: string;
    readonly activeValidatorListServiceURL: string;
}

const Kusama = {
    display: 'Kusama',
    tokenTicker: 'KSM',
    tokenDecimals: 12,
    rpcURL: 'wss://rpc.dotters.network/kusama',
    networkStatusServiceURL: 'wss://rpc.kusama.subvt.io:17888',
    activeValidatorListServiceURL: 'wss://rpc.kusama.subvt.io:17889',
} as Network;

const Polkadot = {
    display: 'Polkadot',
    tokenTicker: 'DOT',
    tokenDecimals: 10,
    rpcURL: 'wss://rpc.dotters.network/polkadot',
    networkStatusServiceURL: 'wss://rpc.polkadot.subvt.io:18888',
    activeValidatorListServiceURL: 'wss://rpc.polkadot.subvt.io:18889',
} as Network;

export { Network, Kusama, Polkadot };
