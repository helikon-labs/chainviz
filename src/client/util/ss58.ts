import { Keyring } from "@polkadot/keyring";
import { CONFIG } from "./config";

const keyring = new Keyring();

function getSS58Address(accountIdHex: string) {
    return keyring.encodeAddress(accountIdHex, CONFIG.network.ss58Prefix);
}

export { getSS58Address };
