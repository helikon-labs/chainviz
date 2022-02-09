import { ValidatorSummary, ValidatorSummaryDiff } from "../model/subvt/validator_summary";
import { CONFIG } from "../util/config";
import { Constants } from "../util/constants";
import { formatNumber } from "../util/format";
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from "../util/ui";

interface UI {
    root: HTMLElement;
    identity: HTMLElement;
    paraInfo: HTMLElement;
    eraData: HTMLElement;
    activeStake: HTMLElement;
    inactiveStake: HTMLElement;
}

class ValidatorSummaryBoard {
    private readonly ui: UI;
    private summary?: ValidatorSummary = undefined;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById("validator-summary-board"),
            identity: <HTMLElement>document.getElementById("validator-summary-identity"),
            paraInfo: <HTMLElement>document.getElementById("validator-summary-para-info"),
            eraData: <HTMLElement>document.getElementById("validator-summary-era-data"),
            activeStake: <HTMLElement>document.getElementById("validator-summary-active-stake"),
            inactiveStake: <HTMLElement>document.getElementById("validator-summary-inactive-stake"),
        };
    }

    show(summary: ValidatorSummary) {
        this.summary = summary;
        // identity & para
        {
            this.ui.identity.innerHTML =
                getValidatorIdentityIconHTML(summary) +
                `<span class="identity">${getValidatorSummaryDisplay(summary)}</span>`;
            if (summary.isParaValidator) {
                const parachain = CONFIG.network.parachainMap.get(summary.paraId ?? 0);
                if (parachain) {
                    const imageHTML = `<img class="parachain-icon" src="${
                        CONFIG.network.parachainMap.get(parachain.id)?.image
                    }" alt="${parachain.name}" title="${parachain.name}" />`;
                    this.ui.paraInfo.innerHTML = `${imageHTML}<span>${parachain.name}</span>`;
                } else {
                    this.ui.paraInfo.innerHTML = "Paravalidator";
                }
                this.ui.paraInfo.style.display = "flex";
            } else {
                this.ui.paraInfo.style.display = "none";
            }
        }
        // era data
        {
            const blockCount = summary.blocksAuthored ?? 0;
            let eraDataHTML = `<span><i class="fas fa-cube"></i>${blockCount}</span>`;
            const points = summary.rewardPoints ?? 0;
            eraDataHTML += `<span><i class="fas fa-line-chart"></i>${points}</span>`;
            if (summary.returnRatePerBillion) {
                const returnRate = formatNumber(BigInt(summary.returnRatePerBillion), 7, 2);
                eraDataHTML += `<span><i class="fas fa-refresh"></i>${returnRate}%</span>`;
            }
            this.ui.eraData.innerHTML = eraDataHTML;
        }
        // stake
        {
            let activeStake = summary.selfStake.activeAmount;
            if (summary.validatorStake) {
                activeStake = summary.validatorStake.totalStake;
            }
            const inactiveStake = summary.inactiveNominations.totalAmount;
            this.ui.activeStake.innerHTML = formatNumber(
                activeStake,
                CONFIG.network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                CONFIG.network.tokenTicker
            );
            this.ui.inactiveStake.innerHTML = formatNumber(
                inactiveStake,
                CONFIG.network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                CONFIG.network.tokenTicker
            );
        }
        this.ui.root.style.visibility = "visible";
    }

    setPosition(x: number, y: number) {
        this.ui.root.style.left = `${x + Constants.HOVER_INFO_BOARD_X_OFFSET}px`;
        this.ui.root.style.top = `${y + Constants.HOVER_INFO_BOARD_Y_OFFSET}px`;
    }

    close() {
        this.ui.root.style.visibility = "hidden";
        this.summary = undefined;
    }

    update(diff: ValidatorSummaryDiff) {
        if (this.summary && this.summary.accountId == diff.accountId) {
            Object.assign(this.summary, diff);
            this.show(this.summary);
        }
    }

    remove(accountIdHex: string) {
        if (this.summary && this.summary.accountId == accountIdHex) {
            this.close();
        }
    }
}

export { ValidatorSummaryBoard };
