import { Network } from '../model/substrate/network';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { formatNumber } from '../util/format';
import { cloneJSONSafeObject } from '../util/object';
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from '../util/ui-util';

interface UI {
    root: HTMLElement;
    identity: HTMLElement;
    paraInfo: HTMLElement;
    blockCount: HTMLElement;
    rewardPoints: HTMLElement;
    returnRate: HTMLElement;
    activeStake: HTMLElement;
    inactiveStake: HTMLElement;
}

class ValidatorSummaryBoard {
    private readonly ui: UI;
    private validator?: ValidatorSummary = undefined;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('validator-summary-board'),
            identity: <HTMLElement>document.getElementById('validator-summary-identity'),
            paraInfo: <HTMLElement>document.getElementById('validator-summary-para-info'),
            blockCount: <HTMLElement>document.getElementById('validator-summary-block-count'),
            rewardPoints: <HTMLElement>document.getElementById('validator-summary-reward-points'),
            returnRate: <HTMLElement>document.getElementById('validator-summary-return-rate'),
            activeStake: <HTMLElement>document.getElementById('validator-summary-active-stake'),
            inactiveStake: <HTMLElement>document.getElementById('validator-summary-inactive-stake'),
        };
    }

    show(network: Network, validator: ValidatorSummary) {
        this.validator = cloneJSONSafeObject(validator);
        // identity & para
        {
            this.ui.identity.innerHTML =
                getValidatorIdentityIconHTML(validator) +
                `<span class="identity">${getValidatorSummaryDisplay(validator)}</span>`;
            if (validator.isParaValidator) {
                const para = network.paras.find((para) => para.paraId == validator.paraId);
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
            const blockCount = validator.blocksAuthored ?? 0;
            this.ui.blockCount.innerHTML = `${blockCount}`;
            const points = validator.rewardPoints ?? 0;
            this.ui.rewardPoints.innerHTML = `${points}`;
            if (validator.returnRatePerBillion) {
                const returnRate = formatNumber(BigInt(validator.returnRatePerBillion), 7, 2);
                this.ui.returnRate.innerHTML = `${returnRate}%`;
            } else {
                this.ui.returnRate.innerHTML = '-';
            }
        }
        // stake
        {
            let activeStake = validator.selfStake.activeAmount;
            if (validator.validatorStake) {
                activeStake = validator.validatorStake.totalStake;
            }
            const inactiveStake = validator.inactiveNominations.totalAmount;
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

    close() {
        this.ui.root.style.visibility = 'hidden';
        this.validator = undefined;
    }

    onValidatorUpdated(network: Network, updatedValidator: ValidatorSummary) {
        if (this.validator && this.validator.accountId == updatedValidator.accountId) {
            Object.assign(this.validator, updatedValidator);
            this.show(network, this.validator);
        }
    }

    onValidatorRemoved(accountIdHex: string) {
        if (this.validator && this.validator.accountId == accountIdHex) {
            this.close();
        }
    }
}

export { ValidatorSummaryBoard };
