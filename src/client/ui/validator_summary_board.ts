import { ValidatorSummary, ValidatorSummaryDiff } from "../model/subvt/validator_summary";
import { CONFIG } from "../util/config";
import { Constants } from "../util/constants";
import { formatNumber } from "../util/format";
import { generateIdenticonSVGHTML } from "../util/identicon";
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from "../util/ui";

interface UI {
    root: HTMLElement;
    identiconContainer: HTMLElement;
    identity: HTMLElement;
    paraInfo: HTMLElement;
    blocks: HTMLElement;
    points: HTMLElement;
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

class ValidatorSummaryBoard {
    private readonly ui: UI;
    private summary?: ValidatorSummary = undefined;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById("validator-summary-board"),
            identiconContainer: <HTMLElement>(
                document.getElementById("validator-summary-identicon-container")
            ),
            identity: <HTMLElement>document.getElementById("validator-summary-identity"),
            paraInfo: <HTMLElement>document.getElementById("validator-summary-para-info"),
            blocks: <HTMLElement>document.getElementById("validator-summary-blocks"),
            points: <HTMLElement>document.getElementById("validator-summary-points"),
            return: <HTMLElement>document.getElementById("validator-summary-return"),
            selfStakeTitle: <HTMLElement>(
                document.getElementById("validator-summary-self-stake-title")
            ),
            selfStakeAmount: <HTMLElement>(
                document.getElementById("validator-summary-self-stake-amount")
            ),
            otherStakeTitle: <HTMLElement>(
                document.getElementById("validator-summary-other-stake-title")
            ),
            otherStakeAmount: <HTMLElement>(
                document.getElementById("validator-summary-other-stake-amount")
            ),
            inactiveStakeTitle: <HTMLElement>(
                document.getElementById("validator-summary-inactive-stake-title")
            ),
            inactiveStakeAmount: <HTMLElement>(
                document.getElementById("validator-summary-inactive-stake-amount")
            ),
            oneKVIcon: <HTMLElement>document.getElementById("validator-summary-icon-1kv"),
            heartbeatIcon: <HTMLElement>document.getElementById("validator-summary-icon-heartbeat"),
            nextSessionIcon: <HTMLElement>(
                document.getElementById("validator-summary-icon-next-session")
            ),
            slashedIcon: <HTMLElement>document.getElementById("validator-summary-icon-slashed"),
            blocksNominationsIcon: <HTMLElement>(
                document.getElementById("validator-summary-icon-blocks-nominations")
            ),
            oversubscribedIcon: <HTMLElement>(
                document.getElementById("validator-summary-icon-oversubscribed")
            ),
        };
    }

    show(summary: ValidatorSummary) {
        this.summary = summary;
        this.ui.identiconContainer.innerHTML = generateIdenticonSVGHTML(
            summary.address,
            Constants.SUMMARY_BOARD_IDENTICON_SIZE
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
        // performance
        {
            const blockCount = summary.blocksAuthored ?? 0;
            this.ui.blocks.innerHTML = `${blockCount} era blocks`;
            const points = summary.rewardPoints ?? 0;
            this.ui.points.innerHTML = `${points} era points`;
            if (summary.returnRatePerBillion) {
                const returnRate = formatNumber(BigInt(summary.returnRatePerBillion), 7, 2);
                this.ui.return.innerHTML = `${returnRate}% return`;
                this.ui.return.style.display = "block";
            } else {
                this.ui.return.style.display = "none";
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
