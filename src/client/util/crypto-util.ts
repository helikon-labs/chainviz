import { Keyring } from '@polkadot/keyring';

const keyring = new Keyring();

function getSS58Address(ss58Prefix: number, accountIdHex: string) {
    return keyring.encodeAddress(accountIdHex, ss58Prefix);
}

export { getSS58Address };
