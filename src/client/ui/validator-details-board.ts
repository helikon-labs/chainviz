import { Network } from '../model/substrate/network';
import { Para } from '../model/substrate/para';
import { ValidatorSummary } from '../model/subvt/validator-summary';
import { Constants } from '../util/constants';
import { getSS58Address } from '../util/crypto-util';
import { formatNumber, getCondensedAddress } from '../util/format';
import { generateIdenticonSVGHTML } from '../util/identicon';
import { cloneJSONSafeObject } from '../util/object';
import {
    getValidatorIdentityIconHTML,
    getValidatorSummaryDisplay,
    hide,
    show,
} from '../util/ui-util';

interface ValidatorDetailsBoardDelegate {
    onClose(): void;
}

/**
 * Validator details board UI.
 */
interface UI {
    root: HTMLElement;
    close: HTMLElement;
    identiconContainer: HTMLElement;
    identity: HTMLElement;
    paraInfoContainer: HTMLElement;
    paraInfo: HTMLElement;
    stashAddress: HTMLElement;
    controllerAddress: HTMLElement;
    commission: HTMLElement;
    blocksInEra: HTMLElement;
    eraRewardPoints: HTMLElement;
    returnRate: HTMLElement;
    selfStakeAmount: HTMLElement;
    activeStakerCount: HTMLElement;
    activeStakeAmount: HTMLElement;
    inactiveNominatorCount: HTMLElement;
    inactiveNominationAmount: HTMLElement;
    iconContainer: HTMLElement;
    oneKVIcon: HTMLElement;
    heartbeatIcon: HTMLElement;
    nextSessionIcon: HTMLElement;
    slashedIcon: HTMLElement;
    blocksNominationsIcon: HTMLElement;
    oversubscribedIcon: HTMLElement;
}

/**
 * Utilized to display a selected validator's details, and gets updated according to the updates
 * from the SubVT active validator list service.
 */
class ValidatorDetailsBoard {
    private readonly ui: UI;
    private readonly delegate: ValidatorDetailsBoardDelegate;
    private mouseIsInside: boolean = false;
    private validator?: ValidatorSummary = undefined;

    constructor(delegate: ValidatorDetailsBoardDelegate) {
        this.delegate = delegate;
        this.ui = {
            root: <HTMLElement>document.getElementById('validator-details-board'),
            close: <HTMLElement>document.getElementById('validator-details-close'),
            identiconContainer: <HTMLElement>(
                document.getElementById('validator-details-identicon-container')
            ),
            identity: <HTMLElement>document.getElementById('validator-details-identity'),
            paraInfoContainer: <HTMLElement>(
                document.getElementById('validator-details-para-info-container')
            ),
            paraInfo: <HTMLElement>document.getElementById('validator-details-para-info'),
            stashAddress: <HTMLElement>document.getElementById('validator-details-stash-address'),
            controllerAddress: <HTMLElement>(
                document.getElementById('validator-details-controller-address')
            ),
            commission: <HTMLElement>document.getElementById('validator-details-commission'),
            blocksInEra: <HTMLElement>document.getElementById('validator-details-blocks-in-era'),
            eraRewardPoints: <HTMLElement>(
                document.getElementById('validator-details-era-reward-points')
            ),
            returnRate: <HTMLElement>document.getElementById('validator-details-return-rate'),
            selfStakeAmount: <HTMLElement>(
                document.getElementById('validator-details-self-stake-amount')
            ),
            activeStakerCount: <HTMLElement>(
                document.getElementById('validator-details-active-staker-count')
            ),
            activeStakeAmount: <HTMLElement>(
                document.getElementById('validator-details-active-stake-amount')
            ),
            inactiveNominatorCount: <HTMLElement>(
                document.getElementById('validator-details-inactive-nominator-count')
            ),
            inactiveNominationAmount: <HTMLElement>(
                document.getElementById('validator-details-inactive-nomination-amount')
            ),
            iconContainer: <HTMLElement>(
                document.getElementById('validator-details-status-icon-container')
            ),
            oneKVIcon: <HTMLElement>document.getElementById('validator-details-icon-onekv'),
            heartbeatIcon: <HTMLElement>document.getElementById('validator-details-icon-heartbeat'),
            nextSessionIcon: <HTMLElement>(
                document.getElementById('validator-details-icon-next-session')
            ),
            slashedIcon: <HTMLElement>document.getElementById('validator-details-icon-slashed'),
            blocksNominationsIcon: <HTMLElement>(
                document.getElementById('validator-details-icon-blocks-nominations')
            ),
            oversubscribedIcon: <HTMLElement>(
                document.getElementById('validator-details-icon-oversubscribed')
            ),
        };
        setTimeout(() => {
            this.ui.close.onclick = () => {
                this.close();
            };
            this.ui.root.onmouseenter = () => {
                this.mouseIsInside = true;
            };
            this.ui.root.onmouseleave = () => {
                this.mouseIsInside = false;
            };
        }, 500);
    }

    getMouseIsInside(): boolean {
        return this.mouseIsInside;
    }

    /**
     * Display the given validator's details.
     *
     * @param network current network
     * @param validator selected validator
     */
    show(network: Network, validator: ValidatorSummary, para: Para | undefined) {
        this.validator = cloneJSONSafeObject(validator);
        this.ui.identiconContainer.innerHTML = generateIdenticonSVGHTML(
            validator.address,
            Constants.VALIDATOR_DETAILS_BOARD_IDENTICON_SIZE,
        );
        this.ui.identity.innerHTML =
            getValidatorIdentityIconHTML(validator) +
            `<span class="identity">${getValidatorSummaryDisplay(validator)}</span>`;
        this.ui.stashAddress.innerHTML = `<a href="https://${network.id}.subscan.io/account/${
            validator.address
        }" target="_blank">${getCondensedAddress(validator.address)}</a>`;
        if (validator.isParaValidator) {
            if (para) {
                const imageHTML = `<img class="parachain-icon" src="/img/paras/${para.ui.logo}" alt="${para.text}" title="${para.text}" />`;
                this.ui.paraInfo.innerHTML = `${imageHTML}<span>${para.text} Paravalidator</span><span class="flex-spacer"></span>`;
            } else {
                this.ui.paraInfo.innerHTML = 'Paravalidator';
            }
            this.ui.paraInfoContainer.style.display = 'block';
        } else {
            this.ui.paraInfoContainer.style.display = 'none';
        }
        if (validator.controllerAccountId == undefined) {
            this.ui.controllerAddress.innerHTML = '-';
        } else {
            const controllerAddress = getSS58Address(
                network.ss58Prefix,
                validator.controllerAccountId,
            );
            this.ui.controllerAddress.innerHTML = `<a href="https://${
                network.id
            }.subscan.io/account/${controllerAddress}" target="_blank">${getCondensedAddress(
                controllerAddress,
            )}</a>`;
        }
        const commission = formatNumber(BigInt(validator.preferences.commissionPerBillion), 7, 2);
        this.ui.commission.innerHTML = `${commission}%`;
        this.ui.blocksInEra.innerHTML = `${validator.blocksAuthored ?? 0}`;
        this.ui.eraRewardPoints.innerHTML = `${validator.rewardPoints ?? 0}`;
        if (validator.returnRatePerBillion) {
            const returnRate = formatNumber(BigInt(validator.returnRatePerBillion), 7, 2);
            this.ui.returnRate.innerHTML = `${returnRate}%`;
        } else {
            this.ui.returnRate.innerHTML = '-';
        }
        this.ui.selfStakeAmount.innerHTML = formatNumber(
            validator.selfStake.activeAmount,
            network.tokenDecimals,
            Constants.BALANCE_FORMAT_DECIMALS,
            network.tokenTicker,
        );
        if (validator.validatorStake) {
            const stake = validator.validatorStake;
            this.ui.activeStakerCount.innerHTML = `${stake.nominatorCount} nom.s`;
            this.ui.activeStakeAmount.innerHTML = formatNumber(
                stake.totalStake - stake.selfStake,
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
        } else {
            this.ui.activeStakerCount.innerHTML = `0 nom.s`;
            this.ui.activeStakeAmount.innerHTML = formatNumber(
                BigInt(0),
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
        }
        if (validator.inactiveNominations.nominationCount > 0) {
            const noms = validator.inactiveNominations;
            this.ui.inactiveNominatorCount.innerHTML = `${noms.nominationCount} nom.s`;
            this.ui.inactiveNominationAmount.innerHTML = formatNumber(
                noms.totalAmount,
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
        } else {
            this.ui.inactiveNominatorCount.innerHTML = `0 nom.s`;
            this.ui.inactiveNominationAmount.innerHTML = formatNumber(
                BigInt(0),
                network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                network.tokenTicker,
            );
        }
        // icons
        {
            let showIconContainer = false;
            if (validator.isEnrolledIn1kv) {
                this.ui.oneKVIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.oneKVIcon.style.display = 'none';
            }
            if (validator.heartbeatReceived ?? false) {
                this.ui.heartbeatIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.heartbeatIcon.style.display = 'none';
            }
            if (validator.isActiveNextSession) {
                this.ui.nextSessionIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.nextSessionIcon.style.display = 'none';
            }
            if (validator.slashCount > 0) {
                this.ui.slashedIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.slashedIcon.style.display = 'none';
            }
            if (validator.preferences.blocksNominations) {
                this.ui.blocksNominationsIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.blocksNominationsIcon.style.display = 'none';
            }
            if (validator.oversubscribed) {
                this.ui.oversubscribedIcon.style.display = 'block';
                showIconContainer = true;
            } else {
                this.ui.oversubscribedIcon.style.display = 'none';
            }
            if (showIconContainer) {
                this.ui.iconContainer.style.display = 'flex';
            } else {
                this.ui.iconContainer.style.display = 'none';
            }
        }
        show(this.ui.root);
    }

    close() {
        hide(this.ui.root);
        this.validator = undefined;
        this.delegate.onClose();
    }

    onValidatorUpdated(
        network: Network,
        updatedValidator: ValidatorSummary,
        para: Para | undefined,
    ) {
        if (this.validator && this.validator.accountId == updatedValidator.accountId) {
            this.show(network, cloneJSONSafeObject(updatedValidator), para);
        }
    }

    onValidatorRemoved(stashAddress: string) {
        if (this.validator && this.validator.address == stashAddress) {
            this.close();
        }
    }
}

export { ValidatorDetailsBoard, ValidatorDetailsBoardDelegate };
