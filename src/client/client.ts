import { ChainViz } from "./chainviz";
import { CONFIG } from "./util/config";

document.addEventListener("DOMContentLoaded", function (_) {
    new ChainViz(CONFIG.networkStatusServiceURL, CONFIG.activeValidatorListServiceURL).init();
});
