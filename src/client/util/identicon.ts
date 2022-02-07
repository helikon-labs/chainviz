import { polkadotIcon } from "@polkadot/ui-shared";

function generateIdenticonSVGHTML(address: string, size: number): string {
    const circles = polkadotIcon(address as string, { isAlternative: false })
        .map(({ cx, cy, fill, r }) => `<circle cx=${cx} cy=${cy} fill="${fill}" r=${r} />`)
        .join("");
    return `<svg height=${size as number} viewBox='0 0 64 64' width=${
        size as number
    }>${circles}</svg>`;
}

export { generateIdenticonSVGHTML };
