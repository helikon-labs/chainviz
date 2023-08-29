import { Kusama, Network } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { formatNumber } from '../util/format';

interface UI {
    root: HTMLElement;
    blockProgress: HTMLElement;
    bestBlock: HTMLElement;
    finalizedBlock: HTMLElement;
    eraIndex: HTMLElement;
    eraRewardPoints: HTMLElement;
    //return: HTMLElement;
    totalStakeTitle: HTMLElement;
    totalStake: HTMLElement;
    minStakeTitle: HTMLElement;
    minStake: HTMLElement;
    maxStakeTitle: HTMLElement;
    maxStake: HTMLElement;
    averageStakeTitle: HTMLElement;
    averageStake: HTMLElement;
}

class NetworkStatusBoard {
    private readonly ui: UI;
    private lastBlockTime = 0;
    private readonly blockTimeMs = 6000;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('network-status'),
            blockProgress: <HTMLElement>document.getElementById('block-progress'),
            bestBlock: <HTMLElement>document.getElementById('network-best-block'),
            finalizedBlock: <HTMLElement>document.getElementById('network-finalized-block'),
            eraIndex: <HTMLElement>document.getElementById('network-era-index'),
            eraRewardPoints: <HTMLElement>document.getElementById('network-era-reward-points'),
            //return: <HTMLElement>document.getElementById('network-return'),
            totalStakeTitle: <HTMLElement>document.getElementById('network-total-stake-title'),
            totalStake: <HTMLElement>document.getElementById('network-total-stake'),
            minStakeTitle: <HTMLElement>document.getElementById('network-min-stake-title'),
            minStake: <HTMLElement>document.getElementById('network-min-stake'),
            maxStakeTitle: <HTMLElement>document.getElementById('network-max-stake-title'),
            maxStake: <HTMLElement>document.getElementById('network-max-stake'),
            averageStakeTitle: <HTMLElement>document.getElementById('network-average-stake-title'),
            averageStake: <HTMLElement>document.getElementById('network-average-stake'),
        };
        this.updateProgressBar();
    }

    setOpacity(opacity: number) {
        this.ui.root.style.opacity = `${opacity}%`;
    }

    updateProgressBar() {
        const elapsed = Math.min(this.blockTimeMs, Date.now() - this.lastBlockTime);
        const progressPercent = (elapsed * 100) / this.blockTimeMs;
        this.ui.blockProgress.style.width = progressPercent + '%';
        setTimeout(() => {
            this.updateProgressBar();
        }, 1);
    }

    display(network: Network, status: NetworkStatus) {
        this.ui.bestBlock.innerHTML = status.bestBlockNumber.toString();
        this.ui.finalizedBlock.innerHTML = status.finalizedBlockNumber.toString();
        this.ui.eraIndex.innerHTML = status.activeEra.index.toString();
        this.ui.eraRewardPoints.innerHTML = status.eraRewardPoints.toString();
        //this.ui.return.innerHTML =
        //    formatNumber(BigInt(status.returnRatePerMillion), 4, 2) + '%';
        this.ui.totalStakeTitle.innerHTML = `Total Stake (M${network.tokenTicker})`;
        this.ui.totalStake.innerHTML = formatNumber(
            status.totalStake,
            network.tokenDecimals + 6,
            2,
        );
        if (network == Kusama) {
            this.ui.minStakeTitle.innerHTML = `Min Stake (${network.tokenTicker})`;
            this.ui.minStake.innerHTML = formatNumber(status.minStake, network.tokenDecimals, 2);
            this.ui.maxStakeTitle.innerHTML = `Max Stake (${network.tokenTicker})`;
            this.ui.maxStake.innerHTML = formatNumber(status.maxStake, network.tokenDecimals, 2);
            this.ui.averageStakeTitle.innerHTML = `Avg Stake (${network.tokenTicker})`;
            this.ui.averageStake.innerHTML = formatNumber(
                status.averageStake,
                network.tokenDecimals,
                2,
            );
        } else {
            this.ui.minStakeTitle.innerHTML = `Min Stake (M${network.tokenTicker})`;
            this.ui.minStake.innerHTML = formatNumber(
                status.minStake,
                network.tokenDecimals + 6,
                2,
            );
            this.ui.maxStakeTitle.innerHTML = `Max Stake (M${network.tokenTicker})`;
            this.ui.maxStake.innerHTML = formatNumber(
                status.maxStake,
                network.tokenDecimals + 6,
                2,
            );
            this.ui.averageStakeTitle.innerHTML = `Avg Stake (M${network.tokenTicker})`;
            this.ui.averageStake.innerHTML = formatNumber(
                status.averageStake,
                network.tokenDecimals + 6,
                2,
            );
        }
        this.lastBlockTime = Date.now();
    }

    getBoundingClientRect(): DOMRect {
        return this.ui.root.getBoundingClientRect();
    }
}

export { NetworkStatusBoard };
