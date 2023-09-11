import { polkadotIcon } from '@polkadot/ui-shared';

/**
 * Generates Polkadot identicon SVG for a given SS58-encoded address.
 * @param address SS58-encoded address
 * @param size SVG size (width == height)
 * @returns identicon SVG HTML
 */
function generateIdenticonSVGHTML(address: string, size: number): string {
    const circles = polkadotIcon(address, { isAlternative: false })
        .map(({ cx, cy, fill, r }) => `<circle cx=${cx} cy=${cy} fill="${fill}" r=${r} />`)
        .join('');
    return `<svg style="width; ${size}; height: ${size};" viewBox='0 0 64 64'>${circles}</svg>`;
}

export { generateIdenticonSVGHTML };
