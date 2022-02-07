//import { network } from "../chainviz";
import { ValidatorSummary } from "../model/subvt/validator_summary";
import { Constants } from "../util/constants";
//import { formatNumber } from "../util/format";
import { generateIdenticonSVGHTML } from "../util/identicon";
//import { cloneJSONSafeObject } from "../util/object";
//import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from "../util/ui";

interface UI {
    root: HTMLElement;
    identiconContainer: HTMLElement;
}

class ValidatorDetailsBoard {
    private readonly ui: UI;
    private summary!: ValidatorSummary;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById("validator-details-board"),
            identiconContainer: <HTMLElement>(
                document.getElementById("validator-details-identicon-container")
            ),
        };
    }

    show(summary: ValidatorSummary) {
        this.summary = summary;
        this.ui.identiconContainer.innerHTML = generateIdenticonSVGHTML(
            summary.address,
            Constants.DETAILS_BOARD_IDENTICON_SIZE
        );
        this.ui.root.style.display = "flex";
    }

    /*
    private hide() {
        this.ui.root.style.display = "none";
    }
    */
}

export { ValidatorDetailsBoard };
