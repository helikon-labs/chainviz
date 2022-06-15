import { kusama } from "../model/app/network";

export const CONFIG = {
    development: true,
    version: "0.1.0-ALPHA",
    host: "alpha.chainviz.app",
    //networkStatusServiceURL: "ws://localhost:7888",
    //activeValidatorListServiceURL: "ws://localhost:7889",
    networkStatusServiceURL: "wss://rpc-test.subvt.io:17888",
    activeValidatorListServiceURL: "wss://rpc-test.subvt.io:17889",
    network: kusama,
};
