import { Constants } from "./constants";

function insertAtIndex(actual: string, index: number, insert: string): string {
    return actual.substring(0, index) + insert + actual.substring(index);
}

function formatNumber(
    value: bigint,
    decimals: number,
    formatDecimals: number,
    ticker?: string
): string {
    let formatted = value.toString();
    while (formatted.length < decimals + 1) {
        formatted = "0" + formatted;
    }
    formatted = formatted.substring(
        0,
        formatted.length - decimals + formatDecimals
    );
    let integerPart = formatted.substring(0, formatted.length - formatDecimals);
    for (let i = integerPart.length - 3; i > 0; i -= 3) {
        integerPart = insertAtIndex(
            integerPart,
            i,
            Constants.THOUSANDS_SEPARATOR
        );
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
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export { formatNumber, getCondensedAddress };
