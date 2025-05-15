import { Para } from '../model/substrate/para';

/**
 * List of Polkadot parachains.
 * From https://github.com/polkadot-js/apps/blob/master/packages/apps-config/src/endpoints/productionRelayPolkadot.ts.
 */
export const POLKADOT_PARAS: Para[] = [
    {
        info: 'PolkadotAssetHub',
        paraId: 1000,
        providers: {
            Dwellir: 'wss://asset-hub-polkadot-rpc.dwellir.com',
            'Dwellir Tunisia': 'wss://statemint-rpc-tn.dwellir.com',
            IBP1: 'wss://sys.ibp.network/asset-hub-polkadot',
            IBP2: 'wss://asset-hub-polkadot.dotters.network',
            LuckyFriday: 'wss://rpc-asset-hub-polkadot.luckyfriday.io',
            OnFinality: 'wss://statemint.api.onfinality.io/public-ws',
            Parity: 'wss://polkadot-asset-hub-rpc.polkadot.io',
            RadiumBlock: 'wss://statemint.public.curie.radiumblock.co/ws',
            Stakeworld: 'wss://dot-rpc.stakeworld.io/assethub',
        },
        text: 'AssetHub',
        ui: {
            color: '#86e62a',
            logo: 'assetHub.svg',
        },
    },
    {
        info: 'polkadotBridgeHub',
        paraId: 1002,
        providers: {
            Dwellir: 'wss://bridge-hub-polkadot-rpc.dwellir.com',
            'Dwellir Tunisia': 'wss://polkadot-bridge-hub-rpc-tn.dwellir.com',
            IBP1: 'wss://sys.ibp.network/bridgehub-polkadot',
            IBP2: 'wss://bridge-hub-polkadot.dotters.network',
            LuckyFriday: 'wss://rpc-bridge-hub-polkadot.luckyfriday.io',
            OnFinality: 'wss://bridgehub-polkadot.api.onfinality.io/public-ws',
            Parity: 'wss://polkadot-bridge-hub-rpc.polkadot.io',
            RadiumBlock: 'wss://bridgehub-polkadot.public.curie.radiumblock.co/ws',
            Stakeworld: 'wss://dot-rpc.stakeworld.io/bridgehub',
        },
        text: 'BridgeHub',
        ui: {
            logo: 'bridgeHub.svg',
        },
    },
    {
        info: 'polkadotCollectives',
        paraId: 1001,
        providers: {
            Dwellir: 'wss://collectives-polkadot-rpc.dwellir.com',
            'Dwellir Tunisia': 'wss://polkadot-collectives-rpc-tn.dwellir.com',
            IBP1: 'wss://sys.ibp.network/collectives-polkadot',
            IBP2: 'wss://collectives-polkadot.dotters.network',
            LuckyFriday: 'wss://rpc-collectives-polkadot.luckyfriday.io',
            OnFinality: 'wss://collectives.api.onfinality.io/public-ws',
            Parity: 'wss://polkadot-collectives-rpc.polkadot.io',
            RadiumBlock: 'wss://collectives.public.curie.radiumblock.co/ws',
            Stakeworld: 'wss://dot-rpc.stakeworld.io/collectives',
        },
        text: 'Collectives',
        ui: {
            color: '#e6777a',
            logo: 'collectives.svg',
        },
    },
    {
        info: 'polkadotCoretime',
        paraId: 1005,
        providers: {
            IBP1: 'wss://sys.ibp.network/coretime-polkadot',
            IBP2: 'wss://coretime-polkadot.dotters.network',
            Parity: 'wss://polkadot-coretime-rpc.polkadot.io',
        },
        text: 'Coretime',
        ui: {
            logo: 'coretime.svg',
        },
    },
    {
        info: 'polkadotPeople',
        paraId: 1004,
        providers: {
            IBP1: 'wss://sys.ibp.network/people-polkadot',
            IBP2: 'wss://people-polkadot.dotters.network',
            LuckyFriday: 'wss://rpc-people-polkadot.luckyfriday.io',
            Parity: 'wss://polkadot-people-rpc.polkadot.io',
            RadiumBlock: 'wss://people-polkadot.public.curie.radiumblock.co/ws',
        },
        text: 'People',
        ui: {
            color: '#e84366',
            logo: 'people.svg',
        },
    },
    {
        homepage: 'https://acala.network/',
        info: 'acala',
        paraId: 2000,
        providers: {
            'Acala Foundation 0': 'wss://acala-rpc-0.aca-api.network',
            'Acala Foundation 1': 'wss://acala-rpc-1.aca-api.network',
            // 'Acala Foundation 2': 'wss://acala-rpc-2.aca-api.network/ws', // https://github.com/polkadot-js/apps/issues/6965
            'Acala Foundation 3': 'wss://acala-rpc-3.aca-api.network/ws',
            Dwellir: 'wss://acala-rpc.dwellir.com',
            IBP1: 'wss://acala.ibp.network',
            IBP2: 'wss://acala.dotters.network',
            // LuckyFriday: 'wss://rpc-acala.luckyfriday.io', // https://github.com/polkadot-js/apps/issues/10728
            // 'Automata 1RPC': 'wss://1rpc.io/aca' // https://github.com/polkadot-js/apps/issues/8648
            OnFinality: 'wss://acala-polkadot.api.onfinality.io/public-ws',
            // 'Polkawallet 0': 'wss://acala.polkawallet.io' // https://github.com/polkadot-js/apps/issues/9760
        },
        text: 'Acala',
        ui: {
            color: '#645AFF',
            logo: 'acala.svg',
        },
    },
    {
        homepage: 'https://ajuna.io',
        info: 'ajuna',
        paraId: 2051,
        providers: {
            AjunaNetwork: 'wss://rpc-para.ajuna.network',
            IBP1: 'wss://ajuna.ibp.network',
            IBP2: 'wss://ajuna.dotters.network',
            OnFinality: 'wss://ajuna.api.onfinality.io/public-ws',
            // RadiumBlock: 'wss://ajuna.public.curie.radiumblock.co/ws' https://github.com/polkadot-js/apps/issues/10990
        },
        text: 'Ajuna Network',
        ui: {
            color: '#161212',
            logo: 'ajuna.png',
        },
    },
    {
        homepage: 'https://www.aresprotocol.io/',
        info: 'odyssey',
        paraId: 2028,
        providers: {
            // AresProtocol: 'wss://wss.odyssey.aresprotocol.io' // https://github.com/polkadot-js/apps/issues/9059
        },
        text: 'Ares Odyssey',
        ui: {
            color: '#1295F0',
            logo: 'ares-odyssey.svg',
        },
    },
    {
        homepage: 'https://astar.network',
        info: 'astar',
        paraId: 2006,
        providers: {
            Astar: 'wss://rpc.astar.network',
            'Automata 1RPC': 'wss://1rpc.io/astr',
            Blast: 'wss://astar.public.blastapi.io',
            Dwellir: 'wss://astar-rpc.dwellir.com',
            OnFinality: 'wss://astar.api.onfinality.io/public-ws',
            RadiumBlock: 'wss://astar.public.curie.radiumblock.co/ws',
            'light client': 'light://substrate-connect/polkadot/astar',
        },
        text: 'Astar',
        ui: {
            color: '#1b6dc1d9',
            logo: 'astar.png',
        },
    },
    {
        homepage: 'https://www.aventus.io/',
        info: 'aventus',
        paraId: 2056,
        providers: {
            Aventus: 'wss://public-rpc.mainnet.aventus.io',
        },
        text: 'Aventus',
        ui: {
            color: '#1d2733',
            logo: 'aventus.svg',
        },
    },
    {
        homepage: 'https://crowdloan.bifrost.app',
        info: 'bifrost',
        paraId: 2030,
        providers: {
            Dwellir: 'wss://bifrost-polkadot-rpc.dwellir.com',
            IBP1: 'wss://bifrost-polkadot.ibp.network',
            IBP2: 'wss://bifrost-polkadot.dotters.network',
            Liebi: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
            LiebiEU: 'wss://eu.bifrost-polkadot-rpc.liebi.com/ws',
            // OnFinality: 'wss://bifrost-polkadot.api.onfinality.io/public-ws',
            // RadiumBlock: 'wss://bifrost.public.curie.radiumblock.co/ws' // https://github.com/polkadot-js/apps/issues/11098
        },
        text: 'Bifrost',
        ui: {
            color: '#5a25f0',
            logo: 'bifrost.svg',
        },
    },
    {
        homepage: 'https://www.bitgreen.org',
        info: 'bitgreen',
        paraId: 2048,
        providers: {
            Bitgreen: 'wss://mainnet.bitgreen.org',
            // OnFinality: 'wss://bitgreen.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9993
        },
        text: 'Bitgreen',
        ui: {
            color: '#224851',
            logo: 'bitgreen.png',
        },
    },
    {
        homepage: 'https://centrifuge.io',
        info: 'centrifuge',
        paraId: 2031,
        providers: {
            Centrifuge: 'wss://fullnode.centrifuge.io',
            Dwellir: 'wss://centrifuge-rpc.dwellir.com',
            LuckyFriday: 'wss://rpc-centrifuge.luckyfriday.io',
            OnFinality: 'wss://centrifuge-parachain.api.onfinality.io/public-ws',
        },
        text: 'Centrifuge',
        ui: {
            color: '#fcc367',
            logo: 'centrifuge.png',
        },
    },
    {
        homepage: 'https://clover.finance',
        info: 'clover',
        paraId: 2002,
        providers: {
            // Clover: 'wss://rpc-para.clover.finance' // https://github.com/polkadot-js/apps/issues/10172
            // OnFinality: 'wss://clover.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9986
        },
        text: 'Clover',
        ui: {
            color: 'linear-gradient(to right, #52ad75, #7cc773)',
            logo: 'clover.svg',
        },
    },
    {
        homepage: 'https://www.coinversation.io/',
        info: 'coinversation',
        paraId: 2027,
        providers: {
            // Coinversation: 'wss://rpc.coinversation.io/' // https://github.com/polkadot-js/apps/issues/6635
        },
        text: 'Coinversation',
        ui: {
            color: '#e6017a',
            logo: 'coinversation.png',
        },
    },
    {
        homepage: 'https://composable.finance/',
        info: 'composable',
        paraId: 2019,
        providers: {
            Composable: 'wss://rpc.composable.finance',
            Dwellir: 'wss://composable-rpc.dwellir.com',
            // OnFinality: 'wss://composable.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9986
        },
        text: 'Composable Finance',
        ui: {
            color: '#C90E8A',
            logo: 'composableFinance.png',
        },
    },
    {
        homepage: 'https://mnet.io/?ref=polkadotjs',
        info: 'continuum',
        paraId: 3346,
        providers: {
            MNet: 'wss://continuum-rpc-1.metaverse.network/wss',
        },
        text: 'Continuum',
        ui: {
            color: 'linear-gradient(94deg, #2B388F 2.95%, #DB126E 97.18%)',
            logo: 'continuum.png',
        },
    },
    {
        homepage: 'https://crust.network',
        info: 'crustParachain',
        paraId: 2008,
        providers: {
            Crust: 'wss://crust-parachain.crustapps.net',
            'Crust APP': 'wss://crust-parachain.crustnetwork.app',
            'Crust CC': 'wss://crust-parachain.crustnetwork.cc',
            'Crust XYZ': 'wss://crust-parachain.crustnetwork.xyz',
            // OnFinality: 'wss://crust-polkadot.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/10013
        },
        text: 'Crust',
        ui: {
            logo: 'crustParachain.svg',
        },
    },
    {
        homepage: 'https://darwinia.network/',
        info: 'darwinia',
        paraId: 2046,
        providers: {
            Darwinia: 'wss://rpc.darwinia.network',
            // Dcdao: 'wss://darwinia-rpc.dcdao.box', https://github.com/polkadot-js/apps/issues/11157
            Dwellir: 'wss://darwinia-rpc.dwellir.com',
            Subquery: 'wss://darwinia.rpc.subquery.network/public/ws',
        },
        text: 'Darwinia',
        ui: {
            color: '#FF0083',
            logo: 'darwinia.svg',
        },
    },
    {
        homepage: 'https://efinity.io',
        info: 'efinity',
        paraId: 2021,
        providers: {
            // NOTE We don't support connections to this parachain at all.
            //
            // 1. The chain is migrated away from the parachain with all balances
            // 2. There is a forked relay-involved which we don't support
            //
            // Additional details in original removal at
            // https://github.com/polkadot-js/apps/pull/9555/files#r1225095086
        },
        text: 'Efinity',
        ui: {
            color: '#496ddb',
            logo: 'efinity.svg',
        },
    },
    {
        homepage: 'https://energywebx.com/',
        info: 'ewx',
        paraId: 3345,
        providers: {
            'Energy Web': 'wss://public-rpc.mainnet.energywebx.com/',
        },
        text: 'Energy Web X',
        ui: {
            color: '#53B1FF',
            logo: 'ewx.svg',
        },
    },
    {
        homepage: 'https://equilibrium.io/',
        info: 'equilibrium',
        paraId: 2011,
        providers: {
            // Dwellir: 'wss://equilibrium-rpc.dwellir.com'
            // OnFinality: 'wss://equilibrium.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9977
            // Equilibrium: 'wss://node.equilibrium.io' // https://github.com/polkadot-js/apps/issues/10174
        },
        text: 'Equilibrium',
        ui: {
            color: '#1792ff',
            logo: 'equilibrium.svg',
        },
    },
    {
        homepage: 'https://frequency.xyz',
        info: 'frequency',
        paraId: 2091,
        providers: {
            Dwellir: 'wss://frequency-rpc.dwellir.com',
            'Frequency 0': 'wss://0.rpc.frequency.xyz',
            'Frequency 1': 'wss://1.rpc.frequency.xyz',
            OnFinality: 'wss://frequency-polkadot.api.onfinality.io/public-ws',
        },
        text: 'Frequency',
        ui: {
            color: '#00b6af',
            logo: 'frequency.svg',
        },
    },
    {
        homepage: 'https://geminis.network/',
        info: 'geminis',
        isUnreachable: true,
        paraId: 2038,
        providers: {
            Geminis: 'wss://rpc.geminis.network',
        },
        text: 'Geminis',
        ui: {
            logo: 'geminis.png',
        },
    },
    {
        homepage: 'https://hashed.network/',
        info: 'hashed',
        paraId: 2093,
        providers: {
            'Hashed Systems 1': 'wss://c1.hashed.network',
            // 'Hashed Systems 2': 'wss://c2.hashed.network', // https://github.com/polkadot-js/apps/issues/10912
            // 'Hashed Systems 3': 'wss://c3.hashed.network' // https://github.com/polkadot-js/apps/issues/10912
        },
        text: 'Hashed Network',
        ui: {
            color: '#9199A9',
            logo: 'hashed.png',
        },
    },
    {
        homepage: 'https://hydration.net/',
        info: 'hydradx',
        paraId: 2034,
        providers: {
            Dwellir: 'wss://hydration-rpc.n.dwellir.com',
            'Galactic Council': 'wss://rpc.hydradx.cloud',
            Helikon: 'wss://rpc.helikon.io/hydradx',
            IBP1: 'wss://hydration.ibp.network',
            IBP2: 'wss://hydration.dotters.network',
            // OnFinality: 'wss://hydradx.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9986
            // ZeePrime: 'wss://rpc-lb.data6.zp-labs.net:8443/hydradx/ws/?token=2ZGuGivPJJAxXiT1hR1Yg2MXGjMrhEBYFjgbdPi' // https://github.com/polkadot-js/apps/issues/9760
        },
        text: 'Hydration',
        ui: {
            color: '#240E32',
            logo: 'hydration.svg',
        },
    },
    {
        homepage: 'https://hyperbridge.network',
        info: 'hyperbridge',
        paraId: 3367,
        providers: {
            BlockOps: 'wss://hyperbridge-nexus-rpc.blockops.network',
            IBP1: 'wss://nexus.ibp.network',
            IBP2: 'wss://nexus.dotters.network',
        },
        text: 'Hyperbridge (Nexus)',
        ui: {
            color: '#ED6FF1',
            logo: 'hyperbridge.png',
        },
    },
    {
        homepage: 'https://dot.crowdloan.integritee.network/',
        info: 'integritee',
        paraId: 3359,
        providers: {
            Dwellir: 'wss://integritee-rpc.dwellir.com',
            Integritee: 'wss://polkadot.api.integritee.network',
        },
        text: 'Integritee Network',
        ui: {
            color: '#658ea9',
            logo: 'integritee.svg',
        },
    },
    {
        homepage: 'https://integritee.network',
        info: 'integritee',
        paraId: 2039,
        providers: {
            // Dwellir: 'wss://integritee-rpc.dwellir.com',
            // Integritee: 'wss://polkadot.api.integritee.network'
        },
        text: 'Integritee Network',
        ui: {
            color: '#2e154b',
            logo: 'integritee.svg',
        },
    },
    {
        homepage: 'https://interlay.io/',
        info: 'interlay',
        paraId: 2032,
        providers: {
            Dwellir: 'wss://interlay-rpc.dwellir.com',
            'Kintsugi Labs': 'wss://api.interlay.io/parachain',
            LuckyFriday: 'wss://rpc-interlay.luckyfriday.io/',
            // OnFinality: 'wss://interlay.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9986
        },
        text: 'Interlay',
        ui: {
            color: '#3E96FF',
            logo: 'interlay.svg',
        },
    },
    {
        homepage: 'https://invarch.network/',
        info: 'invarch',
        paraId: 3340,
        providers: {
            Dwellir: 'wss://invarch-rpc.dwellir.com',
            IBP1: 'wss://invarch.ibp.network',
            IBP2: 'wss://invarch.dotters.network',
        },
        text: 'InvArch',
        ui: {
            color: 'linear-gradient(278deg, #f7d365 5.74%, #ff408a 99.41%)',
            logo: 'invarch.jpeg',
        },
    },
    {
        homepage: 'https://jamton.network/',
        info: 'jamton',
        paraId: 3397,
        providers: {
            Jamton: 'wss://rpc.jamton.network',
        },
        text: 'JAMTON',
        ui: {
            color: '#D33AD6',
            logo: 'jamton.svg',
        },
    },
    {
        homepage: 'https://totemaccounting.com/',
        info: 'kapex',
        paraId: 2007,
        providers: {
            // Dwellir: 'wss://kapex-rpc.dwellir.com'
            // OnFinality: 'wss://kapex-parachain.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9986
            // Totem: 'wss://k-ui.kapex.network' // https://github.com/polkadot-js/apps/issues/9616
        },
        text: 'Kapex',
        ui: {
            color: 'linear-gradient(158deg, rgba(226,157,0,1) 0%, rgba(234,55,203,1) 100%)',
            logo: 'totem.svg',
        },
    },
    {
        homepage: 'https://www.kilt.io/',
        info: 'kilt',
        paraId: 2086,
        providers: {
            BOTLabs: 'wss://spiritnet.kilt.io/',
            Dwellir: 'wss://kilt-rpc.dwellir.com',
            IBP1: 'wss://kilt.ibp.network',
            IBP2: 'wss://kilt.dotters.network',
        },
        text: 'KILT Spiritnet',
        ui: {
            color: '#8c145a',
            logo: 'kilt.png',
        },
    },
    {
        homepage: 'https://kylin.network/',
        info: 'kylin',
        paraId: 2052,
        providers: {
            // 'Kylin Network': 'wss://polkadot.kylin-node.co.uk' // https://github.com/polkadot-js/apps/issues/10030
        },
        text: 'Kylin',
        ui: {
            color: '#ed007e',
            logo: 'kylin.png',
        },
    },
    {
        homepage: 'https://laosnetwork.io/',
        info: 'laos',
        paraId: 3370,
        providers: {
            Dwellir: 'wss://laos-rpc.dwellir.com',
            'freeverse.io': 'wss://rpc.laos.laosfoundation.io',
        },
        text: 'Laos',
        ui: {
            color: 'linear-gradient(90deg, #25143B 0%, #613D93 29.69%, #EF9365 69.79%, #E2CF61 100%)',
            logo: 'laos.png',
        },
    },
    {
        homepage: 'https://www.litentry.com/',
        info: 'litentry',
        paraId: 2013,
        providers: {
            Dwellir: 'wss://litentry-rpc.dwellir.com',
            Litentry: 'wss://rpc.litentry-parachain.litentry.io',
            // OnFinality: 'wss://litentry.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9993
        },
        text: 'Litentry',
        ui: {
            color: '#15B786',
            logo: 'litentry.png',
        },
    },
    {
        homepage: 'https://logion.network/',
        info: 'logion',
        paraId: 3354,
        providers: {
            'Logion 1': 'wss://para-rpc01.logion.network',
            // 'Logion 2': 'wss://para-rpc02.logion.network' // https://github.com/polkadot-js/apps/issues/10890
        },
        text: 'Logion',
        ui: {
            color: 'rgb(21, 38, 101)',
            logo: 'logion.png',
        },
    },
    {
        homepage: 'https://manta.network',
        info: 'manta',
        paraId: 2104,
        providers: {
            'Manta Network': 'wss://ws.manta.systems',
            // OnFinality: 'wss://manta.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9977
        },
        text: 'Manta',
        ui: {
            color: '#2070a6',
            logo: 'manta.png',
        },
    },
    {
        homepage: 'https://moonbeam.network/networks/moonbeam/',
        info: 'moonbeam',
        paraId: 2004,
        providers: {
            Allnodes: 'wss://moonbeam-rpc.publicnode.com',
            // 'Automata 1RPC': 'wss://1rpc.io/glmr', // https://github.com/polkadot-js/apps/issues/10566
            Blast: 'wss://moonbeam.public.blastapi.io',
            Dwellir: 'wss://moonbeam-rpc.n.dwellir.com',
            IBP1: 'wss://moonbeam.ibp.network',
            IBP2: 'wss://moonbeam.dotters.network',
            'Moonbeam Foundation': 'wss://wss.api.moonbeam.network',
            OnFinality: 'wss://moonbeam.api.onfinality.io/public-ws',
            RadiumBlock: 'wss://moonbeam.public.curie.radiumblock.co/ws',
            UnitedBloc: 'wss://moonbeam.unitedbloc.com',
        },
        text: 'Moonbeam',
        ui: {
            color: '#000000',
            logo: 'moonbeam.svg',
        },
    },
    {
        homepage: 'https://moonsama.com',
        info: 'moonsama',
        paraId: 3334,
        providers: {
            // Moonsama: 'wss://rpc.moonsama.com/ws' // https://github.com/polkadot-js/apps/issues/10289
        },
        text: 'Moonsama',
        ui: {
            color: '#1a202c',
            logo: 'moonsama.svg',
        },
    },
    {
        homepage: 'https://mythos.foundation/',
        info: 'mythos',
        paraId: 3369,
        providers: {
            Helikon: 'wss://rpc.helikon.io/mythos',
            parity: 'wss://polkadot-mythos-rpc.polkadot.io',
        },
        text: 'Mythos',
        ui: {
            color: '#262528',
            logo: 'mythos.png',
        },
    },
    {
        homepage: 'https://neuroweb.ai',
        info: 'neuroweb',
        paraId: 2043,
        providers: {
            Dwellir: 'wss://neuroweb-rpc.dwellir.com',
            TraceLabs: 'wss://parachain-rpc.origin-trail.network',
        },
        text: 'NeuroWeb',
        ui: {
            color: '#000000',
            logo: 'neuroweb.png',
        },
    },
    {
        homepage: 'https://nodle.com',
        info: 'nodle',
        paraId: 2026,
        providers: {
            Dwellir: 'wss://nodle-rpc.dwellir.com',
            OnFinality: 'wss://nodle-parachain.api.onfinality.io/public-ws',
        },
        text: 'Nodle',
        ui: {
            color: '#1ab394',
            logo: 'nodle.svg',
        },
    },
    {
        homepage: 'https://oak.tech',
        info: 'oak',
        isUnreachable: true,
        paraId: 2090,
        providers: {
            OAK: 'wss://rpc.oak.tech',
        },
        text: 'OAK Network',
        ui: {
            color: '#A8278C',
            logo: 'oak.png',
        },
    },
    {
        homepage: 'https://www.omnibtc.finance',
        info: 'omnibtc',
        isUnreachable: true,
        paraId: 2053,
        providers: {
            OmniBTC: 'wss://psc-parachain.coming.chat',
        },
        text: 'OmniBTC',
        ui: {
            color: '#6759E9',
            logo: 'omnibtc.svg',
        },
    },
    {
        homepage: 'https://parallel.fi',
        info: 'parallel',
        paraId: 2012,
        providers: {
            // Dwellir: 'wss://parallel-rpc.dwellir.com' , https://github.com/polkadot-js/apps/issues/10997
            Gatotech: 'wss://parallel.gatotech.network',
            // Parallel: 'wss://polkadot-parallel-rpc.parallel.fi' // https://github.com/polkadot-js/apps/issues/11221
            // OnFinality: 'wss://parallel.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9986
        },
        text: 'Parallel',
        ui: {
            color: '#ef18ac',
            logo: 'parallel.svg',
        },
    },
    {
        homepage: 'https://peaq.network/',
        info: 'peaq',
        paraId: 3338,
        providers: {
            // OnFinality: 'wss://peaq.api.onfinality.io/public-ws'
        },
        text: 'peaq',
        ui: {
            color: '#281C66',
            logo: 'peaq.png',
        },
    },
    {
        homepage: 'https://pendulumchain.org/',
        info: 'pendulum',
        paraId: 2094,
        providers: {
            // Dwellir: 'wss://pendulum-rpc.dwellir.com',
            PendulumChain: 'wss://rpc-pendulum.prd.pendulumchain.tech',
        },
        text: 'Pendulum',
        ui: {
            color: '#49E2FD',
            logo: 'pendulum.svg',
        },
    },
    {
        homepage: 'https://phala.network',
        info: 'phala',
        paraId: 2035,
        providers: {
            Dwellir: 'wss://phala-rpc.dwellir.com',
            Helikon: 'wss://rpc.helikon.io/phala',
            OnFinality: 'wss://phala.api.onfinality.io/public-ws',
            Phala: 'wss://api.phala.network/ws',
            RadiumBlock: 'wss://phala.public.curie.radiumblock.co/ws',
            // Rockx: 'wss://rockx-phala.w3node.com/polka-public-phala/ws' // https://github.com/polkadot-js/apps/issues/10728
        },
        text: 'Phala Network',
        ui: {
            color: '#c6fa4c',
            logo: 'phala.svg',
        },
    },
    {
        homepage: 'https://www.polimec.org/',
        info: 'polimec',
        paraId: 3344,
        providers: {
            Amforc: 'wss://polimec.rpc.amforc.com',
            Helikon: 'wss://rpc.helikon.io/polimec',
            IBP1: 'wss://polimec.ibp.network',
            IBP2: 'wss://polimec.dotters.network',
            'Polimec Foundation': 'wss://rpc.polimec.org',
        },
        text: 'Polimec',
        ui: {
            color: '#25311C',
            logo: 'polimec.svg',
        },
    },
    {
        homepage: 'https://polkadex.trade/crowdloans',
        info: 'polkadex',
        paraId: 3363,
        providers: {
            // Dwellir: 'wss://polkadex-parachain-rpc.dwellir.com',
            // OnFinality: 'wss://polkadex-parachain.api.onfinality.io/public-ws',
            // RadiumBlock: 'wss://polkadex-parachain.public.curie.radiumblock.co/ws'
        },
        text: 'Polkadex',
        ui: {
            color: '#7C30DD',
            logo: 'polkadex.svg',
        },
    },
    {
        homepage: 'https://polkadex.trade/',
        info: 'polkadex',
        paraId: 2040,
        providers: {
            Dwellir: 'wss://polkadex-parachain-rpc.dwellir.com',
            OnFinality: 'wss://polkadex-parachain.api.onfinality.io/public-ws',
            RadiumBlock: 'wss://polkadex-parachain.public.curie.radiumblock.co/ws',
        },
        text: 'Polkadex',
        ui: {
            color: '#7C30DD',
            logo: 'polkadex.svg',
        },
    },
    {
        homepage: 'https://robonomics.network/',
        info: 'robonomics',
        paraId: 3388,
        providers: {
            Airalab: 'wss://polkadot.rpc.robonomics.network/',
        },
        text: 'Robonomics',
        ui: {
            color: '#e6007a',
            logo: 'robonomics.svg',
        },
    },
    {
        homepage: 'https://sora.org/',
        info: 'sora',
        paraId: 2025,
        providers: {
            Soramitsu: 'wss://ws.parachain-collator-3.pc3.sora2.soramitsu.co.jp',
        },
        text: 'SORA',
        ui: {
            color: '#2D2926',
            logo: 'sora-substrate.svg',
        },
    },
    {
        homepage: 'https://subdao.network/',
        info: 'subdao',
        isUnreachable: true,
        paraId: 2018,
        providers: {
            SubDAO: 'wss://parachain-rpc.subdao.org',
        },
        text: 'SubDAO',
        ui: {
            color: 'linear-gradient(50deg, #F20092 0%, #FF4D5D 100%)',
            logo: 'subdao.png',
        },
    },
    {
        homepage: 'https://subgame.org/',
        info: 'subgame',
        paraId: 2017,
        providers: {
            // SubGame: 'wss://gamma.subgame.org/' // https://github.com/polkadot-js/apps/pull/6761
        },
        text: 'SubGame Gamma',
        ui: {
            color: '#EB027D',
            logo: 'subgame.svg',
        },
    },
    {
        homepage: 'https://subsocial.network/',
        info: 'subsocial',
        paraId: 2101,
        providers: {
            Dappforce: 'wss://para.subsocial.network',
            Dwellir: 'wss://subsocial-rpc.dwellir.com',
            // OnFinality: 'wss://subsocial-polkadot.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/9977
        },
        text: 'Subsocial',
        ui: {
            color: '#b9018c',
            logo: 'subsocial.svg',
        },
    },
    {
        homepage: 'https://www.t3rn.io/',
        info: 't3rn',
        paraId: 3333,
        providers: {
            // t3rn: 'wss://ws.t3rn.io' https://github.com/polkadot-js/apps/issues/11157
        },
        text: 't3rn',
        ui: {
            color: '#6f3bb2',
            logo: 't3rn.png',
        },
    },
    {
        homepage: 'https://unique.network/',
        info: 'unique',
        paraId: 2037,
        providers: {
            Dwellir: 'wss://unique-rpc.dwellir.com',
            'Geo Load Balancer': 'wss://ws.unique.network',
            IBP1: 'wss://unique.ibp.network',
            IBP2: 'wss://unique.dotters.network',
            // OnFinality: 'wss://unique.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/10030
            'Unique America': 'wss://us-ws.unique.network',
            'Unique Asia': 'wss://asia-ws.unique.network',
            'Unique Europe': 'wss://eu-ws.unique.network',
        },
        text: 'Unique Network',
        ui: {
            color: '#40BCFF',
            logo: 'unique.svg',
        },
    },
    {
        homepage: 'https://www.watr.org/',
        info: 'watr',
        paraId: 2058,
        providers: {
            // Watr: 'wss://watr-rpc.watr-api.network' // https://github.com/polkadot-js/apps/issues/10890
        },
        text: 'Watr Network',
        ui: {
            color: '#373b39',
            logo: 'watr.png',
        },
    },
    {
        homepage: 'https://zeitgeist.pm',
        info: 'zeitgeist',
        paraId: 2092,
        providers: {
            OnFinality: 'wss://zeitgeist.api.onfinality.io/public-ws',
            // ZeitgeistPM: 'wss://main.rpc.zeitgeist.pm/ws' // https://github.com/polkadot-js/apps/issues/11215
        },
        text: 'Zeitgeist',
        ui: {
            color: 'linear-gradient(180deg, rgba(32,90,172,1) 0%, rgba(26,72,138,1) 50%, rgba(13,36,69,1) 100%)',
            logo: 'zeitgeist.png',
        },
    },
];
