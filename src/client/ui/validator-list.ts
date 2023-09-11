import { ValidatorSummary } from '../model/subvt/validator-summary';
import { cloneJSONSafeObject } from '../util/object';
import { getValidatorSummaryDisplay } from '../util/ui-util';

/**
 * Validator list UI.
 */
interface UI {
    container: HTMLElement;
    filterContainer: HTMLElement;
    filterInput: HTMLInputElement;
    list: HTMLElement;
}

interface ValidatorListDelegate {
    onMouseOver(stashAddress: string): void;
    onMouseLeave(stashAddress: string): void;
    onClick(stashAddress: string): void;
}

/**
 * Validator list. Displayed as a tab under the main menu. Supports filter/search by address/identity.
 */
class ValidatorList {
    private readonly delegate: ValidatorListDelegate;
    private readonly ui: UI;
    private validators: ValidatorSummary[] = [];

    constructor(delegate: ValidatorListDelegate) {
        this.delegate = delegate;
        this.ui = {
            container: <HTMLElement>document.getElementById('validator-list-container'),
            filterContainer: <HTMLElement>(
                document.getElementById('validator-list-filter-container')
            ),
            filterInput: <HTMLInputElement>document.getElementById('validator-list-filter-input'),
            list: <HTMLElement>document.getElementById('validator-list'),
        };
        setTimeout(() => {
            this.ui.filterInput.oninput = (_event) => {
                this.filter();
            };
        }, 500);
    }

    initialize(validatorMap: Map<string, ValidatorSummary>) {
        for (const validator of validatorMap.values()) {
            this.validators.push(cloneJSONSafeObject(validator));
        }
        this.sort();
        this.updateTitle();
        this.filter();
    }

    private sort() {
        this.validators.sort((a, b) => {
            if (a.display || a.parentDisplay) {
                if (b.display || b.parentDisplay) {
                    return getValidatorSummaryDisplay(a).localeCompare(
                        getValidatorSummaryDisplay(b),
                    );
                } else {
                    return -1;
                }
            } else {
                if (b.display || b.parentDisplay) {
                    return 1;
                } else {
                    return getValidatorSummaryDisplay(a).localeCompare(
                        getValidatorSummaryDisplay(b),
                    );
                }
            }
        });
    }

    private filter() {
        const query = this.ui.filterInput.value.toLocaleLowerCase().replace(' ', '');
        let filteredValidators;
        if (query.length == 0) {
            filteredValidators = this.validators;
        } else {
            filteredValidators = this.validators.filter((validator) => {
                const text = (
                    getValidatorSummaryDisplay(validator) + validator.address
                ).toLocaleLowerCase();
                return text.indexOf(query) >= 0;
            });
        }
        let html = '';
        for (const validator of filteredValidators) {
            html += `<div class="validator" id="${
                validator.address
            }_list_div"><span class="validator-list-display" id="${
                validator.address
            }_list_span">${getValidatorSummaryDisplay(validator)}</span></div>`;
        }
        this.ui.list.innerHTML = html;
        const rows = Array.from(document.getElementsByClassName('validator'));
        for (const row of rows) {
            const rowElement = <HTMLElement>row;
            rowElement.onmouseover = (event) => {
                const stashAddress = (<HTMLElement>event.target).id
                    .replace('_list_div', '')
                    .replace('_list_span', '');
                this.delegate.onMouseOver(stashAddress);
            };
            rowElement.onmouseleave = (event) => {
                const stashAddress = (<HTMLElement>event.target).id
                    .replace('_list_div', '')
                    .replace('_list_span', '');
                this.delegate.onMouseLeave(stashAddress);
            };
            rowElement.onclick = (event) => {
                const stashAddress = (<HTMLElement>event.target).id
                    .replace('_list_div', '')
                    .replace('_list_span', '');
                this.delegate.onClick(stashAddress);
            };
        }
    }

    private updateTitle() {
        //this.ui.filterInput.placeholder = `Validators (${this.validators.length})`;
        this.ui.filterInput.placeholder = '';
    }

    clear() {
        this.validators = [];
        this.filter();
    }

    onValidatorRemoved(accountIdHex: string) {
        this.validators.splice(
            this.validators.findIndex((validator) => validator.accountId == accountIdHex),
            1,
        );
        document.getElementById(`${accountIdHex}_div`)?.remove();
    }

    onValidatorAdded(validator: ValidatorSummary) {
        this.validators.push(validator);
        this.sort();
        this.filter();
    }

    setOpacity(opacity: number) {
        this.ui.container.style.opacity = `${opacity}%`;
    }

    clearFilter() {
        this.ui.filterInput.value = '';
    }
}

export { ValidatorList, ValidatorListDelegate };
