import { Network } from '../model/substrate/network';
import { NetworkStatus } from '../model/subvt/network-status';
import { formatNumber } from '../util/format';

interface UI {
    root: HTMLElement;
    // progress: HTMLElement;
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

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('network-status'),
            // progress: <HTMLElement>document.getElementById('block-progress'),
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
    }

    setOpacity(opacity: number) {
        this.ui.root.style.opacity = `${opacity}%`;
    }

    display(network: Network, status: NetworkStatus) {
        this.ui.bestBlock.innerHTML = status.bestBlockNumber.toString();
        this.ui.finalizedBlock.innerHTML = status.finalizedBlockNumber.toString();
        this.ui.eraIndex.innerHTML = status.activeEra.index.toString();
        this.ui.eraRewardPoints.innerHTML = status.eraRewardPoints.toString();
        //this.ui.return.innerHTML =
        //    formatNumber(BigInt(status.returnRatePerMillion), 4, 2) + '%';
        this.ui.totalStake.innerHTML = formatNumber(
            status.totalStake,
            network.tokenDecimals + 6,
            2,
        );
        this.ui.minStake.innerHTML = formatNumber(status.minStake, network.tokenDecimals, 2);
        this.ui.maxStake.innerHTML = formatNumber(status.maxStake, network.tokenDecimals, 2);
        this.ui.averageStake.innerHTML = formatNumber(
            status.averageStake,
            network.tokenDecimals,
            2,
        );
    }
}

export { NetworkStatusBoard };
