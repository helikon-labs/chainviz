import { network } from "../chainviz";
import { NetworkStatus, NetworkStatusDiff } from "../model/subvt/network_status";
import { formatNumber } from "../util/format_util";

class NetworkStatusBoard {
    private readonly ui: HTMLElement;;
    private readonly status: NetworkStatus;

    constructor(status: NetworkStatus) {
        this.ui = document.getElementById("network-status")!;
        this.status = status;
        this.updateUI();
        this.ui.style.display = "block";
    }

    update(diff: NetworkStatusDiff) {
        Object.assign(this.status, diff);
        this.updateUI();
    }

    private element(id: string): HTMLElement {
        return document.getElementById(id)!;
    }

    updateUI() {
        this.element("network-best-block").innerHTML = this.status.bestBlockNumber.toString();
        this.element("network-finalized-block").innerHTML = this.status.finalizedBlockNumber.toString();
        this.element("network-era-index").innerHTML = this.status.activeEra.index.toString();
        this.element("network-era-reward-points").innerHTML = this.status.eraRewardPoints.toString();
        this.element("network-return").innerHTML = formatNumber(
            BigInt(this.status.returnRatePerMillion),
            4,
            2
        ) + "%";
        this.element("network-total-stake").innerHTML = formatNumber(
            this.status.totalStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
        this.element("network-min-stake").innerHTML = formatNumber(
            this.status.minStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
        this.element("network-max-stake").innerHTML = formatNumber(
            this.status.maxStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
        this.element("network-average-stake").innerHTML = formatNumber(
            this.status.averageStake,
            network.tokenDecimals,
            4,
            network.tokenTicker,
        );
    }

}

export { NetworkStatusBoard };