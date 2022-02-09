import { ValidatorSummary, ValidatorSummaryDiff } from "../model/subvt/validator_summary";
import { CONFIG } from "../util/config";
import { Constants } from "../util/constants";
import { formatNumber, getCondensedAddress } from "../util/format";
import { generateIdenticonSVGHTML } from "../util/identicon";
import { getSS58Address } from "../util/ss58";
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from "../util/ui";

interface ValidatorDetailsBoardDelegate {
    onClose(accountIdHex: string): void;
}

interface UI {
    root: HTMLElement;
    closeButton: HTMLElement;
    identiconContainer: HTMLElement;
    identity: HTMLElement;
    paraInfo: HTMLElement;
    stash: HTMLElement;
    controller: HTMLElement;
    commission: HTMLElement;
    blocks: HTMLElement;
    points: HTMLElement;
    returnContainer: HTMLElement;
    return: HTMLElement;
    selfStakeTitle: HTMLElement;
    selfStakeAmount: HTMLElement;
    otherStakeTitle: HTMLElement;
    otherStakeAmount: HTMLElement;
    inactiveStakeTitle: HTMLElement;
    inactiveStakeAmount: HTMLElement;
    oneKVIcon: HTMLElement;
    heartbeatIcon: HTMLElement;
    nextSessionIcon: HTMLElement;
    slashedIcon: HTMLElement;
    blocksNominationsIcon: HTMLElement;
    oversubscribedIcon: HTMLElement;
}

class ValidatorDetailsBoard {
    private readonly ui: UI;
    private summary?: ValidatorSummary = undefined;
    private readonly delegate: ValidatorDetailsBoardDelegate;

    constructor(delegate: ValidatorDetailsBoardDelegate) {
        this.delegate = delegate;
        this.ui = {
            root: <HTMLElement>document.getElementById("validator-details-board"),
            closeButton: <HTMLElement>document.getElementById("validator-details-close-button"),
            identiconContainer: <HTMLElement>(
                document.getElementById("validator-details-identicon-container")
            ),
            identity: <HTMLElement>document.getElementById("validator-details-identity"),
            paraInfo: <HTMLElement>document.getElementById("validator-details-para-info"),
            stash: <HTMLElement>document.getElementById("validator-details-stash"),
            controller: <HTMLElement>document.getElementById("validator-details-controller"),
            commission: <HTMLElement>document.getElementById("validator-details-commission"),
            blocks: <HTMLElement>document.getElementById("validator-details-blocks"),
            points: <HTMLElement>document.getElementById("validator-details-points"),
            returnContainer: <HTMLElement>(
                document.getElementById("validator-details-return-container")
            ),
            return: <HTMLElement>document.getElementById("validator-details-return"),
            selfStakeTitle: <HTMLElement>(
                document.getElementById("validator-details-self-stake-title")
            ),
            selfStakeAmount: <HTMLElement>(
                document.getElementById("validator-details-self-stake-amount")
            ),
            otherStakeTitle: <HTMLElement>(
                document.getElementById("validator-details-other-stake-title")
            ),
            otherStakeAmount: <HTMLElement>(
                document.getElementById("validator-details-other-stake-amount")
            ),
            inactiveStakeTitle: <HTMLElement>(
                document.getElementById("validator-details-inactive-stake-title")
            ),
            inactiveStakeAmount: <HTMLElement>(
                document.getElementById("validator-details-inactive-stake-amount")
            ),
            oneKVIcon: <HTMLElement>document.getElementById("validator-details-icon-1kv"),
            heartbeatIcon: <HTMLElement>document.getElementById("validator-details-icon-heartbeat"),
            nextSessionIcon: <HTMLElement>(
                document.getElementById("validator-details-icon-next-session")
            ),
            slashedIcon: <HTMLElement>document.getElementById("validator-details-icon-slashed"),
            blocksNominationsIcon: <HTMLElement>(
                document.getElementById("validator-details-icon-blocks-nominations")
            ),
            oversubscribedIcon: <HTMLElement>(
                document.getElementById("validator-details-icon-oversubscribed")
            ),
        };
        this.ui.closeButton.addEventListener("click", (_event) => {
            this.close();
        });
    }

    show(summary: ValidatorSummary) {
        this.summary = summary;
        this.ui.identiconContainer.innerHTML = generateIdenticonSVGHTML(
            summary.address,
            Constants.DETAILS_BOARD_IDENTICON_SIZE
        );
        // identity & para
        {
            this.ui.identity.innerHTML =
                getValidatorIdentityIconHTML(summary) +
                `<span>${getValidatorSummaryDisplay(summary)}</span>`;
            if (summary.isParaValidator) {
                const parachain = CONFIG.network.parachainMap.get(summary.paraId ?? 0);
                if (parachain) {
                    this.ui.paraInfo.innerHTML = `Validating for ${parachain.name}`;
                } else {
                    this.ui.paraInfo.innerHTML = "Parachain Validator";
                }
                this.ui.paraInfo.style.display = "block";
            } else {
                this.ui.paraInfo.style.display = "none";
            }
        }
        // addresses
        {
            this.ui.stash.innerHTML = `<a href="${CONFIG.network.accountURLPrefix}${
                summary.address
            }"${summary.address}" target="_blank">${getCondensedAddress(summary.address)}</a>`;
            if (summary.controllerAccountId) {
                const controller = getSS58Address(summary.controllerAccountId);
                this.ui.controller.innerHTML = `<a href="${
                    CONFIG.network.accountURLPrefix
                }${controller}"${controller}" target="_blank">${getCondensedAddress(
                    controller
                )}</a>`;
            }
        }
        // performance
        {
            const commission = formatNumber(BigInt(summary.preferences.commissionPerBillion), 7, 2);
            this.ui.commission.innerHTML = `${commission}%`;
            this.ui.blocks.innerHTML = `${summary.blocksAuthored ?? 0}`;
            this.ui.points.innerHTML = `${summary.rewardPoints ?? 0}`;
            if (summary.returnRatePerBillion) {
                const returnRate = formatNumber(BigInt(summary.returnRatePerBillion), 7, 2);
                this.ui.return.innerHTML = `${returnRate}%`;
                this.ui.returnContainer.style.display = "flex";
            } else {
                this.ui.returnContainer.style.display = "none";
            }
        }
        // active stake
        {
            this.ui.selfStakeAmount.innerHTML = formatNumber(
                summary.selfStake.activeAmount,
                CONFIG.network.tokenDecimals,
                Constants.BALANCE_FORMAT_DECIMALS,
                CONFIG.network.tokenTicker
            );
            if (summary.validatorStake) {
                const stake = summary.validatorStake;
                this.ui.otherStakeTitle.innerHTML = `${stake.nominatorCount} nom.s`;
                this.ui.otherStakeAmount.innerHTML = formatNumber(
                    stake.totalStake - stake.selfStake,
                    CONFIG.network.tokenDecimals,
                    Constants.BALANCE_FORMAT_DECIMALS,
                    CONFIG.network.tokenTicker
                );
            } else {
                this.ui.otherStakeTitle.innerHTML = `0 nom.s`;
                this.ui.otherStakeAmount.innerHTML = formatNumber(
                    BigInt(0),
                    CONFIG.network.tokenDecimals,
                    Constants.BALANCE_FORMAT_DECIMALS,
                    CONFIG.network.tokenTicker
                );
            }
        }
        // inactive stake
        {
            if (summary.inactiveNominations.nominationCount > 0) {
                const noms = summary.inactiveNominations;
                this.ui.inactiveStakeTitle.innerHTML = `${noms.nominationCount} nom.s`;
                this.ui.inactiveStakeAmount.innerHTML = formatNumber(
                    noms.totalAmount,
                    CONFIG.network.tokenDecimals,
                    Constants.BALANCE_FORMAT_DECIMALS,
                    CONFIG.network.tokenTicker
                );
            } else {
                this.ui.inactiveStakeTitle.innerHTML = `0 nom.s`;
                this.ui.inactiveStakeAmount.innerHTML = formatNumber(
                    BigInt(0),
                    CONFIG.network.tokenDecimals,
                    Constants.BALANCE_FORMAT_DECIMALS,
                    CONFIG.network.tokenTicker
                );
            }
        }
        // icons
        {
            if (summary.isEnrolledIn1kv) {
                this.ui.oneKVIcon.style.display = "block";
            } else {
                this.ui.oneKVIcon.style.display = "none";
            }
            if (summary.heartbeatReceived ?? false) {
                this.ui.heartbeatIcon.style.display = "block";
            } else {
                this.ui.heartbeatIcon.style.display = "none";
            }
            if (summary.activeNextSession) {
                this.ui.nextSessionIcon.style.display = "block";
            } else {
                this.ui.nextSessionIcon.style.display = "none";
            }
            if (summary.slashCount > 0) {
                this.ui.slashedIcon.style.display = "block";
            } else {
                this.ui.slashedIcon.style.display = "none";
            }
            if (summary.preferences.blocksNominations) {
                this.ui.blocksNominationsIcon.style.display = "block";
            } else {
                this.ui.blocksNominationsIcon.style.display = "none";
            }
            if (summary.oversubscribed) {
                this.ui.oversubscribedIcon.style.display = "block";
            } else {
                this.ui.oversubscribedIcon.style.display = "none";
            }
        }
        this.ui.root.style.display = "flex";
    }

    close() {
        if (this.summary) {
            this.delegate.onClose(this.summary.accountId);
        }
        this.ui.root.style.display = "none";
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

export { ValidatorDetailsBoard, ValidatorDetailsBoardDelegate };
