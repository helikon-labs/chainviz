import { Keyring } from "@polkadot/keyring";
import { network } from "../chainviz";

const keyring = new Keyring();

function getSS58Address(accountIdHex: string) {
    return keyring.encodeAddress(accountIdHex, network.ss58Prefix);
}

export { getSS58Address };
