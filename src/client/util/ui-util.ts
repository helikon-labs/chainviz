import { ValidatorSummary } from '../model/subvt/validator-summary';
import { getCondensedAddress } from './format';

function show(element: HTMLElement) {
    element.classList.remove('no-display');
}

function hide(element: HTMLElement) {
    element.classList.add('no-display');
}

function getValidatorIdentityIconHTML(summary: ValidatorSummary): string {
    if (summary.display) {
        if (summary.confirmed) {
            return '<img src="/img/icon/id-confirmed-icon.svg" class="id-confirmation-icon">';
        } else {
            return '<img src="/img/icon/id-unconfirmed-icon.svg" class="id-confirmation-icon">';
        }
    } else if (summary.parentDisplay) {
        if (summary.confirmed) {
            return '<img src="/img/icon/parent-id-confirmed-icon.svg" class="id-confirmation-icon">';
        } else {
            return '<img src="/img/icon/parent-id-unconfirmed-icon.svg" class="id-confirmation-icon">';
        }
    }
    return '';
}

function getValidatorSummaryDisplay(summary: ValidatorSummary): string {
    let display = '';
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

export { show, hide, getValidatorIdentityIconHTML, getValidatorSummaryDisplay };
