import { ValidatorSummary } from "../model/subvt/validator_summary";
import { getValidatorSummaryDisplay } from "../util/ui";

interface ValidatorListDelegate {
    onMouseOver(accountIdHex: string): void;
    onMouseLeave(accountIdHex: string): void;
    onClick(accountIdHex: string): void;
}

class ValidatorList {
    private readonly delegate: ValidatorListDelegate;
    private readonly container: HTMLElement;
    private readonly titleContainer: HTMLElement;
    private readonly title: HTMLElement;
    private readonly toggle: HTMLElement;
    private readonly searchContainer: HTMLElement;
    private readonly searchInput: HTMLInputElement;
    private readonly list: HTMLElement;
    private items = new Array<ValidatorSummary>();

    constructor(delegate: ValidatorListDelegate) {
        this.delegate = delegate;
        this.container = <HTMLElement>document.getElementById("validator-list-container");
        this.titleContainer = <HTMLElement>(
            document.getElementById("validator-list-title-container")
        );
        this.title = <HTMLElement>document.getElementById("validator-list-title");
        this.toggle = <HTMLElement>document.getElementById("validator-list-toggle");
        this.searchContainer = <HTMLElement>document.getElementById("validator-search-container");
        this.searchInput = <HTMLInputElement>document.getElementById("validator-search-input");
        this.list = <HTMLElement>document.getElementById("validator-list");

        this.titleContainer.addEventListener("click", (_event) => {
            if (this.toggle.classList.contains("up")) {
                this.toggle.classList.remove("up");
                this.list.style.visibility = "hidden";
                this.searchContainer.style.visibility = "hidden";
            } else {
                this.toggle.classList.add("up");
                this.list.style.visibility = "visible";
                this.searchContainer.style.visibility = "visible";
            }
        });
        this.searchInput.oninput = (_event) => {
            this.filter();
        };
    }

    init(summaries: Array<ValidatorSummary>) {
        this.items.push(...summaries);
        this.sort();
        setTimeout(() => {
            this.updateTitle();
            this.filter();
            this.container.style.visibility = "visible";
        }, 1000);
    }

    private sort() {
        this.items.sort((a, b) => {
            if (a.display || a.parentDisplay) {
                if (b.display || b.parentDisplay) {
                    return getValidatorSummaryDisplay(a).localeCompare(
                        getValidatorSummaryDisplay(b)
                    );
                } else {
                    return -1;
                }
            } else {
                if (b.display || b.parentDisplay) {
                    return 1;
                } else {
                    return getValidatorSummaryDisplay(a).localeCompare(
                        getValidatorSummaryDisplay(b)
                    );
                }
            }
        });
    }

    private filter() {
        const query = this.searchInput.value.toLocaleLowerCase().replace(" ", "");
        let filteredItems;
        if (query.length == 0) {
            filteredItems = this.items;
        } else {
            filteredItems = this.items.filter((item) => {
                const text = (getValidatorSummaryDisplay(item) + item.address).toLocaleLowerCase();
                return text.indexOf(query) >= 0;
            });
        }
        let html = "";
        for (const item of filteredItems) {
            html += `<div class="validator" id="${
                item.accountId
            }_div"><span class="validator-list-display" id="${
                item.accountId
            }_span">${getValidatorSummaryDisplay(item)}</span></div>`;
        }
        this.list.innerHTML = html;
        const rows = Array.from(document.getElementsByClassName("validator"));
        for (const row of rows) {
            const rowElement = <HTMLElement>row;
            rowElement.addEventListener("mouseover", (event) => {
                const accountIdHex = (<HTMLElement>event.target).id
                    .replace("_div", "")
                    .replace("_span", "");
                this.delegate.onMouseOver(accountIdHex);
            });
            rowElement.addEventListener("mouseleave", (event) => {
                const accountIdHex = (<HTMLElement>event.target).id
                    .replace("_div", "")
                    .replace("_span", "");
                this.delegate.onMouseLeave(accountIdHex);
            });
            rowElement.addEventListener("click", (event) => {
                const accountIdHex = (<HTMLElement>event.target).id
                    .replace("_div", "")
                    .replace("_span", "");
                this.delegate.onClick(accountIdHex);
            });
        }
    }

    private updateTitle() {
        this.title.innerHTML = `ACTIVE VALIDATORS (${this.items.length})`;
    }

    remove(accountIdHex: string) {
        this.items.splice(
            this.items.findIndex((item) => item.accountId == accountIdHex),
            1
        );
        document.getElementById(`${accountIdHex}_div`)?.remove();
    }

    insert(item: ValidatorSummary) {
        this.items.push(item);
        this.sort();
        this.filter();
    }
}

export { ValidatorListDelegate, ValidatorList };
