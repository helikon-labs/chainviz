import { NetworkStatus, NetworkStatusDiff } from "../model/subvt/network_status";
import { CONFIG } from "../util/config";
import { formatNumber } from "../util/format";

interface UI {
    root: HTMLElement;
    progress: HTMLElement;
    bestBlock: HTMLElement;
    finalizedBlock: HTMLElement;
    eraIndex: HTMLElement;
    eraRewardPoints: HTMLElement;
    return: HTMLElement;
    totalStake: HTMLElement;
    minStake: HTMLElement;
    maxStake: HTMLElement;
    averageStake: HTMLElement;
}

class NetworkStatusBoard {
    private readonly status: NetworkStatus;
    private readonly ui: UI;
    private lastBlockTime = 0;

    constructor(status: NetworkStatus) {
        this.ui = {
            root: <HTMLElement>document.getElementById("network-status"),
            progress: <HTMLElement>document.getElementById("block-progress"),
            bestBlock: <HTMLElement>document.getElementById("network-best-block"),
            finalizedBlock: <HTMLElement>document.getElementById("network-finalized-block"),
            eraIndex: <HTMLElement>document.getElementById("network-era-index"),
            eraRewardPoints: <HTMLElement>document.getElementById("network-era-reward-points"),
            return: <HTMLElement>document.getElementById("network-return"),
            totalStake: <HTMLElement>document.getElementById("network-total-stake"),
            minStake: <HTMLElement>document.getElementById("network-min-stake"),
            maxStake: <HTMLElement>document.getElementById("network-max-stake"),
            averageStake: <HTMLElement>document.getElementById("network-average-stake"),
        };
        this.status = status;
        this.updateUI();
        this.ui.root.style.opacity = "1";
        this.updateProgressBar();
    }

    updateProgressBar() {
        const elapsed = Math.min(CONFIG.network.blockTimeMs, Date.now() - this.lastBlockTime);
        const progressPercent = (elapsed * 100) / CONFIG.network.blockTimeMs;
        this.ui.progress.style.width = progressPercent + "%";
        setTimeout(() => {
            this.updateProgressBar();
        }, 1);
    }

    update(diff: NetworkStatusDiff) {
        Object.assign(this.status, diff);
        this.updateUI();
    }

    setBestBlockNumber(number: number) {
        this.ui.bestBlock.innerHTML = number.toString();
        this.lastBlockTime = Date.now();
    }

    setFinalizedBlockNumber(number: number) {
        this.ui.finalizedBlock.innerHTML = number.toString();
    }

    updateUI() {
        this.ui.eraIndex.innerHTML = this.status.activeEra.index.toString();
        this.ui.eraRewardPoints.innerHTML = this.status.eraRewardPoints.toString();
        this.ui.return.innerHTML =
            formatNumber(BigInt(this.status.returnRatePerMillion), 4, 2) + "%";
        this.ui.totalStake.innerHTML = formatNumber(
            this.status.totalStake,
            CONFIG.network.tokenDecimals + 6,
            4,
            "M" + CONFIG.network.tokenTicker
        );
        this.ui.minStake.innerHTML = formatNumber(
            this.status.minStake,
            CONFIG.network.tokenDecimals,
            4,
            CONFIG.network.tokenTicker
        );
        this.ui.maxStake.innerHTML = formatNumber(
            this.status.maxStake,
            CONFIG.network.tokenDecimals,
            4,
            CONFIG.network.tokenTicker
        );
        this.ui.averageStake.innerHTML = formatNumber(
            this.status.averageStake,
            CONFIG.network.tokenDecimals,
            4,
            CONFIG.network.tokenTicker
        );
    }
}

export { NetworkStatusBoard };
