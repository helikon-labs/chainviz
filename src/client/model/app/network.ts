interface Network {
    name: string,
    ss58Prefix: number,
    tokenDecimals: number,
    tokenTicker: string,
}

const kusama: Network = {
    name: "Kusama",
    ss58Prefix: 2,
    tokenDecimals: 12,
    tokenTicker: "KSM",
};

const polkadot: Network = {
    name: "Polkadot",
    ss58Prefix: 0,
    tokenDecimals: 10,
    tokenTicker: "DOT",
};

export { kusama, polkadot }