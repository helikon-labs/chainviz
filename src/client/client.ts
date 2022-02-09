import { ChainViz } from "./chainviz";
import { CONFIG } from "./util/config";

if (!CONFIG.development && window.location.host != CONFIG.host) {
    window.location.replace("https://" + CONFIG.host);
} else {
    document.addEventListener("DOMContentLoaded", function (_) {
        new ChainViz(CONFIG.networkStatusServiceURL, CONFIG.activeValidatorListServiceURL).init();
    });
}
