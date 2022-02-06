import { ValidatorSummary } from "../model/subvt/validator_summary";
import { getCondensedAddress } from "./format";

function getValidatorIdentityIconHTML(summary: ValidatorSummary): string {
    if (summary.display) {
        if (summary.confirmed) {
            return '<img src="/img/icon/id_confirmed_icon.svg" class="id-confirmation-icon">';
        } else {
            return '<img src="/img/icon/id_unconfirmed_icon.svg" class="id-confirmation-icon">';
        }
    } else if (summary.parentDisplay) {
        if (summary.confirmed) {
            return '<img src="/img/icon/parent_id_confirmed_icon.svg" class="id-confirmed-icon">';
        } else {
            return '<img src="/img/icon/parent_id_unconfirmed_icon.svg" class="id-confirmed-icon">';
        }
    }
    return "";
}

function getValidatorSummaryDisplay(summary: ValidatorSummary): string {
    let display = "";
    if (summary.display) {
        return summary.display;
    } else if (summary.parentDisplay) {
        display += summary.parentDisplay;
        if (summary.childDisplay) {
            display += ` /  ${summary.childDisplay}`;
        }
    }
    if (display.length > 0) {
        return display;
    } else {
        return getCondensedAddress(summary.address);
    }
}

export { getValidatorIdentityIconHTML, getValidatorSummaryDisplay };
