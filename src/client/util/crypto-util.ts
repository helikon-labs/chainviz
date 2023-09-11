import { Keyring } from '@polkadot/keyring';

const keyring = new Keyring();

/**
 * Get SS58-encoded address for an account id.
 *
 * @param ss58Prefix network's SS58 prefix
 * @param accountIdHex account id in hex encoding
 * @returns SS58-encoded address string
 */
function getSS58Address(ss58Prefix: number, accountIdHex: string): string {
    return keyring.encodeAddress(accountIdHex, ss58Prefix);
}

export { getSS58Address };
