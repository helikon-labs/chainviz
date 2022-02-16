import { kusama } from "../model/app/network";

export const CONFIG = {
    development: true,
    version: "0.1.0-ALPHA",
    host: "alpha.chainviz.app",
    networkStatusServiceURL: "wss://subvt-rpc.helikon.io:17888",
    activeValidatorListServiceURL: "wss://subvt-rpc.helikon.io:17889",
    network: kusama,
};
