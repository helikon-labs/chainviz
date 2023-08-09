import { Network } from '../model/substrate/network';
import { ValidatorSummary, ValidatorSummaryDiff } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { formatNumber } from '../util/format';
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from '../util/ui-util';

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
            root: <HTMLElement>document.getElementById('validator-summary-board'),
            identity: <HTMLElement>document.getElementById('validator-summary-identity'),
            paraInfo: <HTMLElement>document.getElementById('validator-summary-para-info'),
            eraData: <HTMLElement>document.getElementById('validator-summary-era-data'),
            activeStake: <HTMLElement>document.getElementById('validator-summary-active-stake'),
            inactiveStake: <HTMLElement>document.getElementById('validator-summary-inactive-stake'),
        };
    }

    show(network: Network, summary: ValidatorSummary) {
        this.summary = summary;
        // identity & para
        {
            this.ui.identity.innerHTML =
                getValidatorIdentityIconHTML(summary) +
                `<span class="identity">${getValidatorSummaryDisplay(summary)}</span>`;
            if (summary.isParaValidator) {
                const para = network.paras.find((para) => para.paraId == summary.paraId);
                if (para) {
                    const imageHTML = `<img class="parachain-icon" src="/img/paras/${para.ui.logo}" alt="${para.text}" title="${para.text}" />`;
                    this.ui.paraInfo.innerHTML = `${imageHTML}<span>${para.text} Paravalidator</span>`;
                } else {
                    this.ui.paraInfo.innerHTML = 'Paravalidator';
                }
                this.ui.paraInfo.style.display = 'flex';
            } else {
                this.ui.paraInfo.style.display = 'none';
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
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
            this.ui.inactiveStake.innerHTML = formatNumber(
                inactiveStake,
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
        }
        this.ui.root.style.visibility = 'visible';
    }

    setPosition(x: number, y: number) {
        this.ui.root.style.left = `${x + Constants.VALIDATOR_SUMMARY_BOARD_X_OFFSET}px`;
        this.ui.root.style.top = `${y + Constants.VALIDATOR_SUMMARY_INFO_BOARD_Y_OFFSET}px`;
    }

    hide() {
        this.ui.root.style.visibility = 'hidden';
        this.summary = undefined;
    }

    update(network: Network, diff: ValidatorSummaryDiff) {
        if (this.summary && this.summary.accountId == diff.accountId) {
            Object.assign(this.summary, diff);
            this.show(network, this.summary);
        }
    }

    remove(accountIdHex: string) {
        if (this.summary && this.summary.accountId == accountIdHex) {
            this.hide();
        }
    }
}

export { ValidatorSummaryBoard };
