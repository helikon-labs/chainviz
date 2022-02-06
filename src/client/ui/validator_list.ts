import { ValidatorSummary } from "../model/subvt/validator_summary";
import { getValidatorSummaryDisplay } from "../util/ui";

class ValidatorList {
    private readonly container: HTMLElement;
    private readonly titleContainer: HTMLElement;
    private readonly title: HTMLElement;
    private readonly toggle: HTMLElement;
    private readonly list: HTMLElement;
    private summaries = new Array<ValidatorSummary>();

    constructor() {
        this.container = <HTMLElement>document.getElementById("validator-list-container");
        this.titleContainer = <HTMLElement>(
            document.getElementById("validator-list-title-container")
        );
        this.title = <HTMLElement>document.getElementById("validator-list-title");
        this.toggle = <HTMLElement>document.getElementById("validator-list-toggle");
        this.list = <HTMLElement>document.getElementById("validator-list");

        this.titleContainer.addEventListener("click", (_event) => {
            if (this.toggle.classList.contains("up")) {
                this.toggle.classList.remove("up");
                this.list.style.visibility = "hidden";
            } else {
                this.toggle.classList.add("up");
                this.list.style.visibility = "visible";
            }
        });
    }

    init(summaries: Array<ValidatorSummary>) {
        this.summaries.push(...summaries);
        this.summaries.sort((a, b) => {
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
            let html = "";
            for (const summary of this.summaries) {
                html += `<div class="validator"><span class="validator-list-display">${getValidatorSummaryDisplay(
                    summary
                )}</span></div>`;
            }
            this.list.innerHTML = html;
            this.title.innerHTML = `VALIDATORS (${this.summaries.length})`;
            this.container.style.visibility = "visible";
        }, 1000);
    }
}

export { ValidatorList };
