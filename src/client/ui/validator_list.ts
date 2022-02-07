import { ValidatorSummary } from "../model/subvt/validator_summary";
import { getValidatorSummaryDisplay } from "../util/ui";

class ValidatorList {
    private readonly container: HTMLElement;
    private readonly titleContainer: HTMLElement;
    private readonly title: HTMLElement;
    private readonly toggle: HTMLElement;
    private readonly searchContainer: HTMLElement;
    private readonly searchInput: HTMLInputElement;
    private readonly list: HTMLElement;
    private items = new Array<ValidatorSummary>();

    constructor() {
        this.container = <HTMLElement>(
            document.getElementById("validator-list-container")
        );
        this.titleContainer = <HTMLElement>(
            document.getElementById("validator-list-title-container")
        );
        this.title = <HTMLElement>(
            document.getElementById("validator-list-title")
        );
        this.toggle = <HTMLElement>(
            document.getElementById("validator-list-toggle")
        );
        this.searchContainer = <HTMLElement>(
            document.getElementById("validator-search-container")
        );
        this.searchInput = <HTMLInputElement>(
            document.getElementById("validator-search-input")
        );
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
            this.filter(this.searchInput.value);
        };
    }

    init(summaries: Array<ValidatorSummary>) {
        this.items.push(...summaries);
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
        setTimeout(() => {
            this.title.innerHTML = `ACTIVE VALIDATORS (${this.items.length})`;
            this.populateList(this.items);
        }, 1000);
    }

    private populateList(items: Array<ValidatorSummary>) {
        let html = "";
        for (const item of items) {
            html += `<div class="validator" id="${
                item.accountId
            }"><span class="validator-list-display">${getValidatorSummaryDisplay(
                item
            )}</span></div>`;
        }
        this.list.innerHTML = html;
        this.container.style.visibility = "visible";
    }

    private filter(filter: string) {
        const query = filter.toLocaleLowerCase().replace(" ", "");
        if (filter.trim().length == 0) {
            this.populateList(this.items);
            return;
        }
        const filteredItems = this.items.filter((item) => {
            const text = (
                getValidatorSummaryDisplay(item) + item.address
            ).toLocaleLowerCase();
            return text.indexOf(query) >= 0;
        });
        this.populateList(filteredItems);
    }
}

export { ValidatorList };
