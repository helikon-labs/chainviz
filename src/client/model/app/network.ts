import { Parachain } from "../../data/parachains";

interface Network {
    name: string,
    ss58Prefix: number,
    tokenDecimals: number,
    tokenTicker: string,
    blockTimeMs: number,
    parachainMap: Map<number, Parachain>
}

const kusama: Network = {
    name: "Kusama",
    ss58Prefix: 2,
    tokenDecimals: 12,
    tokenTicker: "KSM",
    blockTimeMs: 6 * 1000,
    parachainMap: new Map<number, Parachain>([
        [1000, { id: 1000, name: "Statemine", image: "./img/parachain/kusama/1000_statemine.svg" }],
        [1001, { id: 1001, name: "Encointer", image: "./img/parachain/kusama/1001_encointer.svg" }],
        [2000, { id: 2000, name: "Karura", image: "./img/parachain/kusama/2000_karura.svg" }],
        [2001, { id: 2001, name: "Bifrost", image: "./img/parachain/kusama/2001_bifrost.svg" }],
        [2004, { id: 2004, name: "Khala", image: "./img/parachain/kusama/2004_khala.svg" }],
        [2007, { id: 2007, name: "Shiden", image: "./img/parachain/kusama/2007_shiden.png" }],
        [2012, { id: 2012, name: "Crust Shadow", image: "./img/parachain/kusama/2012_crust_shadow.svg" }],
        [2016, { id: 2016, name: "Sakura", image: "./img/parachain/kusama/2016_sakura.svg" }],
        [2023, { id: 2023, name: "Moonriver", image: "./img/parachain/kusama/2023_moonriver.svg" }],
        [2024, { id: 2024, name: "Genshiro", image: "./img/parachain/kusama/2024_genshiro.svg" }],
        [2048, { id: 2048, name: "Robonomics", image: "./img/parachain/kusama/2048_robonomics.svg" }],
        [2084, { id: 2084, name: "Calamari", image: "./img/parachain/kusama/2084_calamari.png" }],
        [2085, { id: 2085, name: "Parallel Heiko", image: "./img/parachain/kusama/2085_parallel_heiko.svg" }],
        [2086, { id: 2086, name: "KILT Spiritnet", image: "./img/parachain/kusama/2086_kilt_spiritnet.png" }],
        [2087, { id: 2087, name: "Picasso", image: "./img/parachain/kusama/2087_picasso.svg" }],
        [2088, { id: 2088, name: "Altair", image: "./img/parachain/kusama/2088_altair.svg" }],
        [2090, { id: 2090, name: "Basilisk", image: "./img/parachain/kusama/2090_basilisk.png" }],
        [2092, { id: 2092, name: "Kintsugi BTC", image: "./img/parachain/kusama/2092_kintsugi_btc.png" }],
        [2095, { id: 2095, name: "QUARTZ", image: "./img/parachain/kusama/2095_quartz.png" }],
        [2096, { id: 2096, name: "Bit.Country", image: "./img/parachain/kusama/2096_bit_country.png" }],
        [2100, { id: 2100, name: "Subsocial", image: "./img/parachain/kusama/2100_subsocial.svg" }],
        [2101, { id: 2101, name: "Zeitgeist", image: "./img/parachain/kusama/2101_zeitgeist.png" }],
    ]),
};

const polkadot: Network = {
    name: "Polkadot",
    ss58Prefix: 0,
    tokenDecimals: 10,
    tokenTicker: "DOT",
    blockTimeMs: 6 * 1000,
    parachainMap: new Map<number, Parachain>(),
};

export { kusama, polkadot }