import { Constants } from './constants';

/**
 * Insert a string into another string.
 *
 * @param actual actual string
 * @param index index in the actual string
 * @param insert string to be inserted
 * @returns newly formed string
 */
function insertAtIndex(actual: string, index: number, insert: string): string {
    return actual.substring(0, index) + insert + actual.substring(index);
}

/**
 * Formats a big number for display purposes.
 *
 * @param value big number value
 * @param decimals number of decimals
 * @param formatDecimals number of decimals to be displayed
 * @param ticker token ticker, if to be appended
 * @returns formatted number
 */
function formatNumber(
    value: bigint,
    decimals: number,
    formatDecimals: number,
    ticker?: string,
): string {
    let formatted = value.toString();
    while (formatted.length < decimals + 1) {
        formatted = '0' + formatted;
    }
    formatted = formatted.substring(0, formatted.length - decimals + formatDecimals);
    let integerPart = formatted.substring(0, formatted.length - formatDecimals);
    for (let i = integerPart.length - 3; i > 0; i -= 3) {
        integerPart = insertAtIndex(integerPart, i, Constants.THOUSANDS_SEPARATOR);
    }

    const decimalPart = formatted.substring(formatted.length - formatDecimals);
    formatted = `${integerPart}${Constants.DECIMAL_SEPARATOR}${decimalPart}`;
    if (ticker) {
        return `${formatted} ${ticker}`;
    } else {
        return formatted;
    }
}

/**
 * Shortens an SS58 address by taking 6 characters from each end, and adding three dots in between.
 *
 * @param address SS58-encoded address
 * @returns condensed address
 */
function getCondensedAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

/**
 * Shortens a hash string by taking given number of characters from each end, and adding three dots in between.
 *
 * @param hash hash in hex format
 * @param size number of characters to be taken from each end
 * @returns condensed hash
 */
function getCondensedHash(hash: string, size: number) {
    return `${hash.slice(0, size)}...${hash.slice(-size)}`;
}

/**
 * Capitalizes a given string - only the first character.
 *
 * @param text input
 * @returns input capitalized
 */
function capitalize(text: string): string {
    return text[0].toUpperCase() + text.substring(1);
}

/**
 * Zero-padder.
 * @param n input number
 * @param width total width
 * @returns zero-padded number
 */
function pad(n: number, width: number): string {
    const z = '0';
    const nStr = n.toString();
    return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + nStr;
}

/**
 * Block time formatter.
 *
 * @param date block time
 * @returns formatted block time
 */
function getBlockTimeFormatted(date: Date): string {
    const year = date.getFullYear().toString();
    const month = pad(date.getMonth() + 1, 2);
    const day = pad(date.getDate(), 2);
    const hour = pad(date.getHours(), 2);
    const minute = pad(date.getMinutes(), 2);
    const second = pad(date.getSeconds(), 2);
    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
}

export { formatNumber, getCondensedAddress, getCondensedHash, capitalize, getBlockTimeFormatted };
