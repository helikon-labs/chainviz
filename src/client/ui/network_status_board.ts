import { network } from "../chainviz";
import { NetworkStatus, NetworkStatusDiff } from "../model/subvt/network_status";
import { formatNumber } from "../util/format_util";

interface UI {
    root: HTMLElement,
    progress: HTMLElement,
    bestBlock: HTMLElement,
    finalizedBlock: HTMLElement,
    eraIndex: HTMLElement,
    eraRewardPoints: HTMLElement,
    return: HTMLElement,
    totalStake: HTMLElement,
    minStake: HTMLElement,
    maxStake: HTMLElement,
    averageStake: HTMLElement,
}

class NetworkStatusBoard {
    private readonly status: NetworkStatus;
    private readonly ui: UI;
    private lastBlockTime = 0;

    constructor(status: NetworkStatus) {
        this.ui = {
            root: document.getElementById("network-status")!,
            progress: document.getElementById("block-progress")!,
            bestBlock: document.getElementById("network-best-block")!,
            finalizedBlock: document.getElementById("network-finalized-block")!,
            eraIndex: document.getElementById("network-era-index")!,
            eraRewardPoints: document.getElementById("network-era-reward-points")!,
            return: document.getElementById("network-return")!,
            totalStake: document.getElementById("network-total-stake")!,
            minStake: document.getElementById("network-min-stake")!,
            maxStake: document.getElementById("network-max-stake")!,
            averageStake: document.getElementById("network-average-stake")!,
        };
        this.status = status;
        this.updateUI();
        this.ui.root.style.display = "block";
        this.updateProgressBar();
    }

    updateProgressBar() {
        const elapsed = Math.min(
            network.blockTimeMs,
            Date.now() - this.lastBlockTime
        );
        const progressPercent = elapsed * 100 / network.blockTimeMs;
        this.ui.progress.style.width = progressPercent + "%";
        setTimeout(() => {
            this.updateProgressBar();
        }, 1);
    }

    update(diff: NetworkStatusDiff) {
        Object.assign(this.status, diff);
        this.updateUI();
    }

    updateUI() {
        this.lastBlockTime = Date.now();
        this.ui.bestBlock.innerHTML = this.status.bestBlockNumber.toString();
        this.ui.finalizedBlock.innerHTML = this.status.finalizedBlockNumber.toString();
        this.ui.eraIndex.innerHTML = this.status.activeEra.index.toString();
        this.ui.eraRewardPoints.innerHTML = this.status.eraRewardPoints.toString();
        this.ui.return.innerHTML = formatNumber(
            BigInt(this.status.returnRatePerMillion),
            4,
            2
        ) + "%";
        this.ui.totalStake.innerHTML = formatNumber(
            this.status.totalStake,
            network.tokenDecimals + 6,
            4,
            "M" + network.tokenTicker,
        );
        this.ui.minStake.innerHTML = formatNumber(
            this.status.minStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
        this.ui.maxStake.innerHTML = formatNumber(
            this.status.maxStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
        this.ui.averageStake.innerHTML = formatNumber(
            this.status.averageStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
    }
}

export { NetworkStatusBoard };