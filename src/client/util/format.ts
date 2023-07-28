import { Constants } from './constants';

function insertAtIndex(actual: string, index: number, insert: string): string {
    return actual.substring(0, index) + insert + actual.substring(index);
}

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

function getCondensedAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function getCondensedHash(hash: string, size: number) {
    return `${hash.slice(0, size)}...${hash.slice(-size)}`;
}

function capitalize(text: string): string {
    return text[0].toUpperCase() + text.substring(1);
}

function pad(n: number, width: number): string {
    const z = '0';
    const nStr = n.toString();
    return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + nStr;
}

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
