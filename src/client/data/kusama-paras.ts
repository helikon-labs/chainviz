import { Para } from '../model/substrate/para';

/**
 * List of Polkadot parachains.
 * From https://github.com/polkadot-js/apps/blob/master/packages/apps-config/src/endpoints/productionRelayKusama.ts.
 */
export const KUSAMA_PARAS: Para[] = [
    {
        info: 'KusamaAssetHub',
        paraId: 1000,
        providers: {
            Dwellir: 'wss://asset-hub-kusama-rpc.dwellir.com',
            'Dwellir Tunisia': 'wss://statemine-rpc-tn.dwellir.com',
            IBP1: 'wss://sys.ibp.network/asset-hub-kusama',
            IBP2: 'wss://asset-hub-kusama.dotters.network',
            LuckyFriday: 'wss://rpc-asset-hub-kusama.luckyfriday.io',
            // OnFinality: 'wss://statemine.api.onfinality.io/public-ws',
            Parity: 'wss://kusama-asset-hub-rpc.polkadot.io',
            RadiumBlock: 'wss://statemine.public.curie.radiumblock.co/ws',
            Stakeworld: 'wss://ksm-rpc.stakeworld.io/assethub',
        },
        text: 'AssetHub',
        ui: {
            color: '#113911',
            logo: 'assetHub.svg',
        },
    },
    {
        info: 'kusamaBridgeHub',
        paraId: 1002,
        providers: {
            Dwellir: 'wss://bridge-hub-kusama-rpc.dwellir.com',
            'Dwellir Tunisia': 'wss://kusama-bridge-hub-rpc-tn.dwellir.com',
            IBP1: 'wss://sys.ibp.network/bridgehub-kusama',
            IBP2: 'wss://bridge-hub-kusama.dotters.network',
            LuckyFriday: 'wss://rpc-bridge-hub-kusama.luckyfriday.io',
            // OnFinality: 'wss://bridgehub-kusama.api.onfinality.io/public-ws',
            Parity: 'wss://kusama-bridge-hub-rpc.polkadot.io',
            RadiumBlock: 'wss://bridgehub-kusama.public.curie.radiumblock.co/ws',
            Stakeworld: 'wss://ksm-rpc.stakeworld.io/bridgehub',
        },
        text: 'BridgeHub',
        ui: {
            logo: 'bridgeHub.svg',
        },
    },
    {
        info: 'kusamaCoretime',
        paraId: 1005,
        providers: {
            Dwellir: 'wss://coretime-kusama-rpc.dwellir.com',
            IBP1: 'wss://sys.ibp.network/coretime-kusama',
            IBP2: 'wss://coretime-kusama.dotters.network',
            LuckyFriday: 'wss://rpc-coretime-kusama.luckyfriday.io',
            Parity: 'wss://kusama-coretime-rpc.polkadot.io',
            Stakeworld: 'wss://ksm-rpc.stakeworld.io/coretime',
        },
        text: 'Coretime',
        ui: {
            color: '#113911',
            logo: 'coretime.svg',
        },
    },
    {
        homepage: 'https://encointer.org/',
        info: 'encointer',
        paraId: 1001,
        providers: {
            Dwellir: 'wss://encointer-kusama-rpc.dwellir.com',
            'Encointer Association': 'wss://kusama.api.encointer.org',
            IBP1: 'wss://sys.ibp.network/encointer-kusama',
            IBP2: 'wss://encointer-kusama.dotters.network',
            // OnFinality: 'wss://encointer.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9986
            // Stakeworld: 'wss://ksm-rpc.stakeworld.io/encointer'
        },
        text: 'Encointer Network',
        ui: {
            color: '#0000cc',
            logo: 'encointer-blue.svg',
        },
    },
    {
        info: 'kusamaPeople',
        paraId: 1004,
        providers: {
            Dwellir: 'wss://people-kusama-rpc.dwellir.com',
            IBP1: 'wss://sys.ibp.network/people-kusama',
            IBP2: 'wss://people-kusama.dotters.network',
            LuckyFriday: 'wss://rpc-people-kusama.luckyfriday.io',
            Parity: 'wss://kusama-people-rpc.polkadot.io',
            Stakeworld: 'wss://ksm-rpc.stakeworld.io/people',
        },
        text: 'People',
        ui: {
            color: '#36454F',
            logo: 'people.svg',
        },
    },

    {
        homepage: 'https://a.band',
        info: 'aband',
        paraId: 2257,
        providers: {
            // 'Aband DAO': 'wss://rpc-parachain.a.band' // https://github.com/polkadot-js/apps/issues/9334
        },
        text: 'Aband',
        ui: {
            color: '#7358ff',
            logo: 'aband.svg',
        },
    },
    {
        homepage: 'https://acurast.com',
        info: 'acurast',
        paraId: 2239,
        providers: {
            Acurast: 'wss://public-rpc.canary.acurast.com',
            // Acurast: 'wss://acurast-canarynet-ws.prod.gke.papers.tech' // https://github.com/polkadot-js/apps/issues/10667
        },
        text: 'Acurast Canary',
        ui: {
            color: '#000000',
            logo: 'acurast.png',
        },
    },
    {
        homepage: 'https://centrifuge.io/altair',
        info: 'altair',
        paraId: 2088,
        providers: {
            Centrifuge: 'wss://fullnode.altair.centrifuge.io',
            OnFinality: 'wss://altair.api.onfinality.io/public-ws',
        },
        text: 'Altair',
        ui: {
            color: '#ffb700',
            logo: 'altair.svg',
        },
    },
    {
        homepage: 'https://pendulumchain.org/amplitude',
        info: 'amplitude',
        paraId: 2124,
        providers: {
            Dwellir: 'wss://amplitude-rpc.dwellir.com',
            PendulumChain: 'wss://rpc-amplitude.pendulumchain.tech',
        },
        text: 'Amplitude',
        ui: {
            color: '#5DEFA7',
            logo: 'amplitude.svg',
        },
    },
    {
        homepage: 'https://ajuna.io',
        info: 'bajun',
        paraId: 2119,
        providers: {
            AjunaNetwork: 'wss://rpc-para.bajun.network',
            // OnFinality: 'wss://bajun.api.onfinality.io/public-ws'
            // RadiumBlock: 'wss://bajun.public.curie.radiumblock.co/ws' https://github.com/polkadot-js/apps/issues/11157
        },
        text: 'Bajun Network',
        ui: {
            color: '#161212',
            logo: 'ajuna.png',
        },
    },
    {
        homepage: 'https://app.basilisk.cloud',
        info: 'basilisk',
        paraId: 2090,
        providers: {
            Basilisk: 'wss://rpc.basilisk.cloud',
            Dwellir: 'wss://basilisk-rpc.n.dwellir.com',
            // OnFinality: 'wss://basilisk.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9414
        },
        text: 'Basilisk',
        ui: {
            color: '#49E49F',
            logo: 'basilisk.png',
        },
    },
    {
        homepage: 'https://ksm.vtoken.io/?ref=polkadotjs',
        info: 'bifrost',
        paraId: 2001,
        providers: {
            Dwellir: 'wss://bifrost-rpc.dwellir.com',
            Liebi: 'wss://bifrost-rpc.liebi.com/ws',
            LiebiUS: 'wss://us.bifrost-rpc.liebi.com/ws',
            // OnFinality: 'wss://bifrost-parachain.api.onfinality.io/public-ws'
            RadiumBlock: 'wss://bifrost.public.curie.radiumblock.co/ws',
        },
        text: 'Bifrost',
        ui: {
            color: '#5a25f0',
            logo: 'bifrost.svg',
        },
    },
    {
        homepage: 'https://www.calamari.network/',
        info: 'calamari',
        paraId: 2084,
        providers: {
            'Manta Network': 'wss://calamari.systems',
        },
        text: 'Calamari',
        ui: {
            color: '#000000',
            logo: 'calamari.png',
        },
    },
    {
        homepage: 'https://crab.network',
        info: 'crab',
        paraId: 2105,
        providers: {
            Darwinia: 'wss://crab-rpc.darwinia.network/',
            Dcdao: 'wss://crab-rpc.dcdao.box',
            Dwellir: 'wss://darwiniacrab-rpc.dwellir.com',
        },
        text: 'Crab',
        ui: {
            color: '#512DBC',
            logo: 'crab.svg',
        },
    },
    {
        homepage: 'https://crust.network/',
        info: 'shadow',
        paraId: 2012,
        providers: {
            Crust: 'wss://rpc-shadow.crust.network/',
            'Crust APP': 'wss://rpc-shadow.crustnetwork.app',
            'Crust CC': 'wss://rpc-shadow.crustnetwork.cc',
            'Crust XYZ': 'wss://rpc-shadow.crustnetwork.xyz',
        },
        text: 'Crust Shadow',
        ui: {
            logo: 'shadow.svg',
        },
    },
    {
        homepage: 'https://crust.network/',
        info: 'shadow',
        isUnreachable: true,
        paraId: 2225,
        providers: {
            // also duplicated right above (hence marked unreachable)
            // Crust: 'wss://rpc-shadow.crust.network/' // https://github.com/polkadot-js/apps/issues/8355
        },
        text: 'Crust Shadow 2',
        ui: {
            logo: 'shadow.svg',
        },
    },
    {
        info: 'curio',
        paraId: 3339,
        providers: {
            Curio: 'wss://parachain.curioinvest.com/',
        },
        text: 'Curio',
        ui: {
            color: 'rgb(96, 98, 246)',
            logo: 'curio.svg',
        },
    },
    {
        homepage: 'https://ipci.io',
        info: 'ipci',
        paraId: 2222,
        providers: {
            Airalab: 'wss://ipci.rpc.robonomics.network',
        },
        text: 'DAO IPCI',
        ui: {
            logo: 'ipci.svg',
        },
    },
    {
        homepage: 'https://dorafactory.org/kusama/',
        info: 'dorafactory',
        paraId: 2115,
        providers: {
            // DORA: 'wss://kusama.dorafactory.org' // https://github.com/polkadot-js/apps/issues/9748
        },
        text: 'Dora Factory',
        ui: {
            color: '#FF761C',
            logo: 'dorafactory.png',
        },
    },
    {
        homepage: 'https://genshiro.io',
        info: 'Genshiro',
        paraId: 2024,
        providers: {
            // Genshiro: 'wss://node.genshiro.io' // https://github.com/polkadot-js/apps/issues/10174
        },
        text: 'Genshiro',
        ui: {
            color: '#e8662d',
            logo: 'genshiro.svg',
        },
    },
    {
        homepage: 'https://genshiro.equilibrium.io',
        info: 'genshiro',
        isUnreachable: true,
        paraId: 2226,
        providers: {
            // Equilibrium: 'wss://node.genshiro.io' // https://github.com/polkadot-js/apps/issues/10174
        },
        text: 'Genshiro crowdloan 2',
        ui: {
            color: '#e8662d',
            logo: 'genshiro.svg',
        },
    },
    {
        homepage: 'https://gmordie.com',
        info: 'gm',
        paraId: 2123,
        providers: {
            // GMorDieDAO: 'wss://kusama.gmordie.com', // https://github.com/polkadot-js/apps/issues/8457
            // 'GM Intern': 'wss://intern.gmordie.com', // https://github.com/polkadot-js/apps/issues/9381
            // TerraBioDAO: 'wss://ws-node-gm.terrabiodao.org', // https://github.com/polkadot-js/apps/issues/8867
            // Leemo: 'wss://leemo.gmordie.com', // https://github.com/polkadot-js/apps/issues/9712
            // 'bLd Nodes': 'wss://ws.gm.bldnodes.org', // https://github.com/polkadot-js/apps/issues/9947
            'light client': 'light://substrate-connect/kusama/gm',
        },
        text: 'GM',
        ui: {
            color: '#f47b36',
            logo: 'gm.jpeg',
        },
    },
    {
        homepage: 'https://hyperbridge.network',
        info: 'hyperbridge',
        paraId: 3340,
        providers: {
            // BlockOps: 'wss://hyperbridge-messier-rpc.blockops.network' // https://github.com/polkadot-js/apps/issues/10555
        },
        text: 'Hyperbridge (Messier)',
        ui: {
            color: '#ED6FF1',
            logo: 'hyperbridge.png',
        },
    },
    {
        homepage: 'https://imbue.network',
        info: 'imbue',
        paraId: 2121,
        providers: {
            'Imbue Network 0': 'wss://kusama.imbuenetwork.com',
            // 'Imbue Network 1': 'wss://collator.production.imbue.network' // https://github.com/polkadot-js/apps/issues/9848
        },
        text: 'Imbue Network',
        ui: {
            color: '#baff36',
            logo: 'imbue.png',
        },
    },
    {
        homepage: 'https://integritee.network',
        info: 'integritee',
        paraId: 2015,
        providers: {
            Integritee: 'wss://kusama.api.integritee.network',
            OnFinality: 'wss://integritee-kusama.api.onfinality.io/public-ws',
        },
        text: 'Integritee Network',
        ui: {
            color: '#2e154b',
            logo: 'integritee.svg',
        },
    },
    {
        homepage: 'https://invarch.network/tinkernet',
        info: 'tinker',
        paraId: 2125,
        providers: {
            // 'InvArch Team': 'wss://tinker.invarch.network', // https://github.com/polkadot-js/apps/issues/8623
            // OnFinality: 'wss://invarch-tinkernet.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9955
            'light client': 'light://substrate-connect/kusama/tinkernet',
        },
        text: 'InvArch Tinkernet',
        ui: {
            color: '#161616',
            logo: 'tinker.png',
        },
    },
    {
        homepage: 'https://kabocha.network',
        info: 'kabocha',
        paraId: 2113,
        providers: {
            JelliedOwl: 'wss://kabocha.jelliedowl.net',
        },
        text: 'Kabocha',
        ui: {
            color: 'repeating-radial-gradient(black, black 4px, yellow 5px)',
            logo: 'kabocha.svg',
        },
    },
    {
        homepage: 'https://acala.network/karura/join-karura',
        info: 'karura',
        paraId: 2000,
        providers: {
            'Acala Foundation 0': 'wss://karura-rpc-0.aca-api.network',
            'Acala Foundation 1': 'wss://karura-rpc-1.aca-api.network',
            'Acala Foundation 2': 'wss://karura-rpc-2.aca-api.network/ws',
            'Acala Foundation 3': 'wss://karura-rpc-3.aca-api.network/ws',
            Dwellir: 'wss://karura-rpc.dwellir.com',
            // LuckyFriday: 'wss://rpc-karura.luckyfriday.io',  // https://github.com/polkadot-js/apps/issues/10663
            OnFinality: 'wss://karura.api.onfinality.io/public-ws',
            // 'Polkawallet 0': 'wss://karura.polkawallet.io' // https://github.com/polkadot-js/apps/issues/9383
        },
        text: 'Karura',
        ui: {
            color: '#ff4c3b',
            logo: 'karura.svg',
        },
    },
    {
        homepage: 'https://phala.network/',
        info: 'khala',
        paraId: 2004,
        providers: {
            Dwellir: 'wss://khala-rpc.dwellir.com',
            Helikon: 'wss://rpc.helikon.io/khala',
            OnFinality: 'wss://khala.api.onfinality.io/public-ws',
            // Phala: 'wss://khala-api.phala.network/ws', // https://github.com/polkadot-js/apps/issues/11178
            RadiumBlock: 'wss://khala.public.curie.radiumblock.co/ws',
            // Rockx: 'wss://rockx-khala.w3node.com/polka-public-khala/ws' // https://github.com/polkadot-js/apps/issues/10728
        },
        text: 'Khala Network',
        ui: {
            color: '#03f3f3',
            logo: 'khala.svg',
        },
    },
    {
        homepage: 'https://dico.io/',
        info: 'kico',
        paraId: 2107,
        providers: {
            // 'DICO Foundation': 'wss://rpc.kico.dico.io' // https://github.com/polkadot-js/apps/issues/9266
            // 'DICO Foundation 2': 'wss://rpc.api.kico.dico.io' // https://github.com/polkadot-js/apps/issues/8203
        },
        text: 'KICO',
        ui: {
            color: '#29B58D',
            logo: 'kico.png',
        },
    },
    {
        homepage: 'https://dico.io/',
        info: 'kico 2',
        paraId: 2235,
        providers: {
            // 'DICO Foundation': 'wss://rpc.kico2.dico.io' // https://github.com/polkadot-js/apps/issues/8415
        },
        text: 'KICO 2',
        ui: {
            color: '#29B58D',
            logo: 'kico.png',
        },
    },
    {
        homepage: 'https://kintsugi.interlay.io/',
        info: 'kintsugi',
        paraId: 2092,
        providers: {
            Dwellir: 'wss://kintsugi-rpc.dwellir.com',
            'Kintsugi Labs': 'wss://api-kusama.interlay.io/parachain',
            // LuckyFriday: 'wss://rpc-kintsugi.luckyfriday.io/', // https://github.com/polkadot-js/apps/issues/9947
            OnFinality: 'wss://kintsugi.api.onfinality.io/public-ws',
        },
        text: 'Kintsugi BTC',
        ui: {
            color: '#1a0a2d',
            logo: 'kintsugi.png',
        },
    },
    {
        homepage: 'https://apron.network/',
        info: 'kpron',
        isUnreachable: true,
        paraId: 2019,
        providers: {
            Kpron: 'wss://kusama-kpron-rpc.apron.network/',
        },
        text: 'Kpron',
        ui: {
            color: 'linear-gradient(45deg, #0099F7 0%, #2E49EB 100%)',
            logo: 'apron.png',
        },
    },
    {
        homepage: 'https://virto.network/',
        info: 'kreivo',
        paraId: 2281,
        providers: {
            Kippu: 'wss://kreivo.kippu.rocks/',
            Virto: 'wss://kreivo.io/',
        },
        text: 'Kreivo',
        ui: {
            color: '#294940',
            logo: 'kreivo.svg',
        },
    },
    {
        homepage: 'https://krest.peaq.network/',
        info: 'krest',
        paraId: 2241,
        providers: {
            Dwellir: 'wss://krest-rpc.dwellir.com',
            Krest: 'wss://wss-krest.peaq.network/',
            OnFinality: 'wss://krest.api.onfinality.io/public-ws',
            // UnitedBloc: 'wss://krest.unitedbloc.com/' https://github.com/polkadot-js/apps/issues/10997
        },
        text: 'Krest',
        ui: {
            logo: 'krest.png',
        },
    },
    {
        homepage: 'https://listen.io/',
        info: 'listen',
        paraId: 2118,
        providers: {
            // 'Listen Foundation 1': 'wss://rpc.mainnet.listen.io', // https://github.com/polkadot-js/apps/issues/9069
            // 'Listen Foundation 2': 'wss://wss.mainnet.listen.io' // https://github.com/polkadot-js/apps/issues/9106
        },
        text: 'Listen Network',
        ui: {
            color: '#FFAD0A',
            logo: 'listen.png',
        },
    },
    {
        homepage: 'https://www.litentry.com/',
        info: 'litmus',
        paraId: 2106,
        providers: {
            // Litentry: 'wss://rpc.litmus-parachain.litentry.io' // https://github.com/polkadot-js/apps/issues/10912
        },
        text: 'Litmus',
        ui: {
            color: '#3913D3',
            logo: 'litmus.png',
        },
    },
    {
        homepage: 'https://loomx.io/',
        info: 'loomNetwork',
        paraId: 2080,
        providers: {
            // LoomNetwork: 'wss://kusama.dappchains.com' // https://github.com/polkadot-js/apps/issues/5888
        },
        text: 'Loom Network',
        ui: {
            logo: 'loom_network.png',
        },
    },
    {
        homepage: 'https://mangata.finance',
        info: 'mangata',
        paraId: 2110,
        providers: {
            'Mangata Archive': 'wss://kusama-archive.mangata.online',
            'Mangata RPC': 'wss://kusama-rpc.mangata.online',
        },
        text: 'Mangata',
        ui: {
            color: '#030408',
            logo: 'mangata.png',
        },
    },
    {
        homepage: 'https://www.aresprotocol.io/mars',
        info: 'mars',
        paraId: 2008,
        providers: {
            // AresProtocol: 'wss://wss.mars.aresprotocol.io' // https://github.com/polkadot-js/apps/issues/8937
        },
        text: 'Mars',
        ui: {
            color: '#E56239',
            logo: 'ares-mars.png',
        },
    },
    {
        homepage: 'https://moonbeam.network/networks/moonriver/',
        info: 'moonriver',
        paraId: 2023,
        providers: {
            Allnodes: 'wss://moonriver-rpc.publicnode.com',
            Blast: 'wss://moonriver.public.blastapi.io',
            Dwellir: 'wss://moonriver-rpc.n.dwellir.com',
            'Moonbeam Foundation': 'wss://wss.api.moonriver.moonbeam.network',
            OnFinality: 'wss://moonriver.api.onfinality.io/public-ws',
            RadiumBlock: 'wss://moonriver.public.curie.radiumblock.co/ws',
            UnitedBloc: 'wss://moonriver.unitedbloc.com',
        },
        text: 'Moonriver',
        ui: {
            color: '#06353d',
            logo: 'moonriver.svg',
        },
    },
    {
        homepage: 'https://parallel.fi',
        info: 'heiko',
        paraId: 2085,
        providers: {
            // OnFinality: 'wss://parallel-heiko.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9964
            Parallel: 'wss://heiko-rpc.parallel.fi',
        },
        text: 'Parallel Heiko',
        ui: {
            color: '#42d5de',
            logo: 'parallel.svg',
        },
    },
    {
        homepage: 'https://parallel.fi',
        info: 'heiko',
        isUnreachable: true,
        paraId: 2126,
        providers: {},
        text: 'Parallel Heiko 2',
        ui: {
            color: '#42d5de',
            logo: 'parallel.svg',
        },
    },
    {
        homepage: 'https://picasso.composable.finance/',
        info: 'picasso',
        paraId: 2087,
        providers: {
            Composable: 'wss://rpc.composablenodes.tech',
            Dwellir: 'wss://picasso-rpc.dwellir.com',
            // LuckyFriday: 'wss://rpc-picasso.luckyfriday.io' // https://github.com/polkadot-js/apps/issues/9947
        },
        text: 'Picasso',
        ui: {
            color: '#000000',
            logo: 'picasso.png',
        },
    },
    {
        homepage: 'https://kylin.network/',
        info: 'pichiu',
        paraId: 2102,
        providers: {
            // 'Kylin Network': 'wss://kusama.kylin-node.co.uk' // https://github.com/polkadot-js/apps/issues/9560
        },
        text: 'Pichiu',
        ui: {
            color: '#ed007e',
            logo: 'kylin.png',
        },
    },
    {
        homepage: 'https://pioneer.bit.country/?ref=polkadotjs',
        info: 'pioneer',
        paraId: 2096,
        providers: {
            MetaverseNetwork: 'wss://pioneer-rpc-3.bit.country/wss',
            // OnFinality: 'wss://pioneer.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9955
        },
        text: 'Pioneer',
        ui: {
            color: '#000000',
            logo: 'bitcountry.png',
        },
    },
    {
        homepage: 'https://polkasmith.polkafoundry.com/',
        info: 'polkasmith',
        paraId: 2009,
        providers: {
            // PolkaSmith: 'wss://wss-polkasmith.polkafoundry.com' // https://github.com/polkadot-js/apps/issues/6595
        },
        text: 'PolkaSmith by PolkaFoundry',
        ui: {
            color: '#0DDDFB',
            logo: 'polkasmith.svg',
        },
    },
    {
        info: 'qpn',
        paraId: 2274,
        providers: {
            // FerrumNetwork: 'wss://qpn.svcs.ferrumnetwork.io/' // https://github.com/polkadot-js/apps/issues/10172
        },
        text: 'Quantum Portal Network',
        ui: {
            color: '#b37700',
            logo: 'qpn.png',
        },
    },
    {
        homepage: 'https://unique.network/',
        info: 'quartz',
        paraId: 2095,
        providers: {
            Dwellir: 'wss://quartz-rpc.dwellir.com',
            // OnFinality: 'wss://quartz.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9972
            'Geo Load Balancer': 'wss://ws-quartz.unique.network',
            'Unique America': 'wss://us-ws-quartz.unique.network',
            'Unique Asia': 'wss://asia-ws-quartz.unique.network',
            'Unique Europe': 'wss://eu-ws-quartz.unique.network',
        },
        text: 'QUARTZ by UNIQUE',
        ui: {
            color: '#FF4D6A',
            logo: 'quartz.png',
        },
    },
    {
        homepage: 'https://riodefi.com',
        info: 'riodefi',
        paraId: 2227,
        providers: {
            // RioProtocol: 'wss://rio-kusama.riocorenetwork.com' // https://github.com/polkadot-js/apps/issues/9261
        },
        text: 'RioDeFi',
        ui: {
            color: '#4E7AED',
            logo: 'riodefi.png',
        },
    },
    {
        homepage: 'https://robonomics.network/',
        info: 'robonomics',
        paraId: 2048,
        providers: {
            Airalab: 'wss://kusama.rpc.robonomics.network/',
            // Dwellir: 'wss://robonomics-rpc.dwellir.com', // https://github.com/polkadot-js/apps/issues/10912
            // Leemo: 'wss://robonomics.leemo.me', // https://github.com/polkadot-js/apps/issues/9817
            // OnFinality: 'wss://robonomics.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9824
            // Samsara: 'wss://robonomics.0xsamsara.com' https://github.com/polkadot-js/apps/issues/11026
        },
        text: 'Robonomics',
        ui: {
            color: '#000000',
            logo: 'robonomics.svg',
        },
    },
    {
        homepage: 'https://robonomics.network/',
        info: 'robonomics',
        isUnreachable: true,
        paraId: 2240,
        providers: {
            Airalab: 'wss://kusama.rpc.robonomics.network/',
            // Leemo: 'wss://robonomics.leemo.me', // https://github.com/polkadot-js/apps/issues/9817
            // OnFinality: 'wss://robonomics.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9824
            // Samsara: 'wss://robonomics.0xsamsara.com' https://github.com/polkadot-js/apps/issues/11026
        },
        text: 'Robonomics 2',
        ui: {
            color: '#2949d3',
            logo: 'robonomics.svg',
        },
    },
    {
        homepage: 'https://clover.finance/',
        info: 'sakura',
        isUnreachable: true,
        paraId: 2016,
        providers: {
            Clover: 'wss://api-sakura.clover.finance',
        },
        text: 'Sakura',
        ui: {
            color: '#ff5995',
            logo: 'sakura.svg',
        },
    },
    {
        homepage: 'https://shiden.astar.network/',
        info: 'shiden',
        paraId: 2007,
        providers: {
            Astar: 'wss://rpc.shiden.astar.network',
            Blast: 'wss://shiden.public.blastapi.io',
            Dwellir: 'wss://shiden-rpc.dwellir.com',
            OnFinality: 'wss://shiden.api.onfinality.io/public-ws',
            RadiumBlock: 'wss://shiden.public.curie.radiumblock.co/ws',
            'light client': 'light://substrate-connect/kusama/shiden',
        },
        text: 'Shiden',
        ui: {
            color: '#5923B2',
            logo: 'shiden.png',
        },
    },
    {
        homepage: 'https://shiden.astar.network/',
        info: 'shiden',
        isUnreachable: true,
        paraId: 2120,
        providers: {
            StakeTechnologies: 'wss://rpc.shiden.astar.network',
        },
        text: 'Shiden Crowdloan 2',
        ui: {
            color: '#5923B2',
            logo: 'shiden.png',
        },
    },
    {
        homepage: 'https://icenetwork.io/snow',
        info: 'snow',
        paraId: 2129,
        providers: {
            // IceNetwork: 'wss://snow-rpc.icenetwork.io' // https://github.com/polkadot-js/apps/issues/9405
        },
        text: 'SNOW Network',
        ui: {
            logo: 'snow.png',
        },
    },
    {
        homepage: 'https://sora.org/',
        info: 'sora',
        paraId: 2011,
        providers: {
            Soramitsu: 'wss://ws.parachain-collator-2.c2.sora2.soramitsu.co.jp',
        },
        text: 'SORA',
        ui: {
            color: '#2D2926',
            logo: 'sora-substrate.svg',
        },
    },
    {
        homepage: 'https://subgame.org/',
        info: 'subgame',
        paraId: 2018,
        providers: {
            // SubGame: 'wss://gamma.subgame.org/' // https://github.com/polkadot-js/apps/issues/7982
        },
        text: 'SubGame Gamma',
        ui: {
            color: '#EB027D',
            logo: 'subgame.svg',
        },
    },
    {
        homepage: 'https://subsocial.network/',
        info: 'subsocialX',
        paraId: 2100,
        providers: {
            // 'Dappforce 1': 'wss://para.subsocial.network'
        },
        text: 'SubsocialX',
        ui: {
            color: '#69058C',
            logo: 'subsocial.svg',
        },
    },
    {
        homepage: 'https://www.t3rn.io/',
        info: 't1rn',
        paraId: 3334,
        providers: {
            // t3rn: 'wss://rpc.t1rn.io' // https://github.com/polkadot-js/apps/issues/10091
        },
        text: 't1rn',
        ui: {
            color: '#131532',
            logo: 't3rn.png',
        },
    },
    {
        homepage: 'https://www.datahighway.com/',
        info: 'tanganika',
        paraId: 2116,
        providers: {
            // DataHighway: 'wss://tanganika.datahighway.com' // https://github.com/polkadot-js/apps/issues/9383
        },
        text: 'Tanganika',
        ui: {
            color: 'linear-gradient(-90deg, #9400D3 0%, #5A5CA9 50%, #00BFFF 100%)',
            logo: 'datahighway.png',
        },
    },
    {
        homepage: 'https://trustbase.network/',
        info: 'trustbase',
        isUnreachable: true,
        paraId: 2078,
        providers: {},
        text: 'TrustBase',
        ui: {
            color: '#ff43aa',
            logo: 'trustbase.png',
        },
    },
    {
        homepage: 'https://oak.tech',
        info: 'turing',
        paraId: 2114,
        providers: {
            Dwellir: 'wss://turing-rpc.dwellir.com',
            // OAK: 'wss://rpc.turing.oak.tech' // https://github.com/polkadot-js/apps/issues/11098
        },
        text: 'Turing Network',
        ui: {
            color: '#A8278C',
            logo: 'turing.png',
        },
    },
    {
        homepage: 'https://standard.tech/',
        info: 'unorthodox',
        paraId: 2094,
        providers: {
            // 'Standard Protocol': 'wss://rpc.kusama.standard.tech' // https://github.com/polkadot-js/apps/issues/8525
        },
        text: 'Unorthodox',
        ui: {
            color: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(42,244,187,1) 35%, rgba(10,10,10,1) 100%)',
            logo: 'unorthodox.png',
        },
    },
    {
        homepage: 'https://xode.net',
        info: 'xode',
        paraId: 3344,
        providers: {
            XodeCommunity: 'wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc',
        },
        text: 'Xode',
        ui: {
            color: '#ed1f7a',
            logo: 'xode.png',
        },
    },
    {
        homepage: 'https://yerba.network',
        info: 'yerba',
        paraId: 3345,
        providers: {},
        text: 'Yerba Network',
        ui: {
            color: '#a5503c',
            logo: 'yerbanetwork.png',
        },
    },
    {
        homepage: 'https://zero.io',
        info: 'zero',
        paraId: 2236,
        providers: {
            // 'Zero Network': 'wss://rpc-1.kusama.node.zero.io' // https://github.com/polkadot-js/apps/issues/10803
            // GameDAO: 'wss://rpc-1.gamedao.net' https://github.com/polkadot-js/apps/issues/11026
        },
        text: 'ZERO Canary',
        ui: {
            color: '#000000',
            logo: 'zero.svg',
        },
    },
];
