import { getCondensedAddress } from "../../util/format";
import { getSS58Address } from "../../util/ss58";
import { InactiveNominationsSummary } from "../substrate/nomination";
import { StakeSummary } from "../substrate/stake";
import { ValidatorPreferences } from "../substrate/validator_preferences";
import { ValidatorStakeSummary } from "../substrate/validator_stake";

interface ValidatorSummary {
    accountId: string;
    controllerAccountId?: string;
    display?: string;
    parentDisplay?: string;
    childDisplay?: string;
    confirmed: boolean;
    preferences: ValidatorPreferences;
    selfStake: StakeSummary;
    isActive: boolean;
    activeNextSession: boolean;
    inactiveNominations: InactiveNominationsSummary;
    oversubscribed: boolean;
    slashCount: number;
    isEnrolledIn1kv: boolean;
    isParaValidator: boolean;
    paraId?: number;
    returnRatePerBillion?: number;
    blocksAuthored?: number;
    rewardPoints?: number;
    heartbeatReceived?: boolean;
    validatorStake?: ValidatorStakeSummary;
}

interface ValidatorSummaryDiff {
    accountId: string;
    controllerAccountId?: string;
    display?: string;
    parentDisplay?: string;
    childDisplay?: string;
    confirmed?: boolean;
    preferences?: ValidatorPreferences;
    selfStake?: StakeSummary;
    isActive?: boolean;
    activeNextSession?: boolean;
    inactiveNominations?: InactiveNominationsSummary;
    oversubscribed?: boolean;
    slashCount?: number;
    isEnrolledIn1kv?: boolean;
    isParaValidator?: boolean;
    paraId?: number;
    returnRatePerBillion?: number;
    blocksAuthored?: number;
    rewardPoints?: number;
    heartbeatReceived?: boolean;
    validatorStake?: ValidatorStakeSummary;
}

interface ValidatorListUpdate {
    finalizedBlockNumber?: number;
    insert: [ValidatorSummary];
    update: [ValidatorSummaryDiff];
    removeIds: [string];
}

function getValidatorSummaryDisplayHTML(summary: ValidatorSummary) {
    const address = getSS58Address(summary.accountId);
    let display = "";
    if (summary.display) {
        if (summary.confirmed) {
            display += "<img src=\"/img/icon/id_confirmed_icon.svg\" class=\"id-confirmed-icon\">";
        } else {
            display += "<img src=\"/img/icon/id_unconfirmed_icon.svg\" class=\"id-confirmed-icon\">";
        }
        display += `<span class="validator-list-display">${summary.display}</span>`;
    } else if (summary.parentDisplay) {
        if (summary.confirmed) {
            display += "<img src=\"/img/icon/parent_id_confirmed_icon.svg\" class=\"id-confirmed-icon\">";
        } else {
            display += "<img src=\"/img/icon/parent_id_unconfirmed_icon.svg\" class=\"id-confirmed-icon\">";
        }
        display += `<span class="validator-list-display">${summary.parentDisplay}`;
        if (summary.childDisplay) {
            display += ` /  ${summary.childDisplay}</span>`;
        } else {
            display += "</span>";
        }
    }
    if (display.length > 0) {
        return display;
    } else {
        return getCondensedAddress(address);
    }
}

export {
    ValidatorSummary,
    ValidatorSummaryDiff,
    ValidatorListUpdate,
    getValidatorSummaryDisplayHTML,
};