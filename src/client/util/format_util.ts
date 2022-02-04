import { Constants } from "./constants";

function formatNumber(
    value: bigint,
    decimals: number,
    formatDecimals: number,
    ticker?: string,
): string {    
    let formatted = value.toString();
    while (formatted.length < decimals + 1) {
        formatted = "0" + formatted;
    }
    formatted = formatted.substring(
        0,
        formatted.length - decimals + formatDecimals
    );
    formatted = formatted.substring(0, formatted.length - formatDecimals) 
        + Constants.DECIMAL_SEPARATOR
        + formatted.substring(formatted.length - formatDecimals);
    if (ticker) {
        return `${formatted} ${ticker}`
    } else {
        return formatted
    }
}

function getCondensedAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export { formatNumber, getCondensedAddress };