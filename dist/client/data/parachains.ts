interface Parachain {
    readonly id: number;
    readonly name: string;
    readonly image: string;
}

const parachains: Array<Parachain> = [
    { id: 1000, name: "Statemine", image: "./img/parachain/1000_statemine.svg" },
    { id: 1001, name: "Encointer", image: "./img/parachain/1001_encointer.svg" },
    { id: 2000, name: "Karura", image: "./img/parachain/2000_karura.svg" },
    { id: 2001, name: "Bifrost", image: "./img/parachain/2001_bifrost.svg" },
    { id: 2004, name: "Khala", image: "./img/parachain/2004_khala.svg" },
    { id: 2007, name: "Shiden", image: "./img/parachain/2007_shiden.png" },
    { id: 2012, name: "Crust Shadow", image: "./img/parachain/2012_crust_shadow.svg" },
    { id: 2016, name: "Sakura", image: "./img/parachain/2016_sakura.svg" },
    { id: 2023, name: "Moonriver", image: "./img/parachain/2023_moonriver.svg" },
    { id: 2024, name: "Genshiro", image: "./img/parachain/2024_genshiro.svg" },
    { id: 2048, name: "Robonomics", image: "./img/parachain/2048_robonomics.svg" },
    { id: 2084, name: "Calamari", image: "./img/parachain/2084_calamari.png" },
    { id: 2085, name: "Parallel Heiko", image: "./img/parachain/2085_parallel_heiko.svg" },
    { id: 2086, name: "KILT Spiritnet", image: "./img/parachain/2086_kilt_spiritnet.png" },
    { id: 2087, name: "Picasso", image: "./img/parachain/2087_picasso.svg" },
    { id: 2088, name: "Altair", image: "./img/parachain/2088_altair.svg" },
    { id: 2090, name: "Basilisk", image: "./img/parachain/2090_basilisk.png" },
    { id: 2092, name: "Kintsugi BTC", image: "./img/parachain/2092_kintsugi_btc.png" },
    { id: 2095, name: "QUARTZ", image: "./img/parachain/2095_quartz.png" },
    { id: 2096, name: "Bit.Country", image: "./img/parachain/2096_bit_country.png" },
    { id: 2100, name: "Subsocial", image: "./img/parachain/2100_subsocial.svg" },
    { id: 2101, name: "Zeitgeist", image: "./img/parachain/2101_zeitgeist.png" },
]

export { parachains };