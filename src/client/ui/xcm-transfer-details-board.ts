import { XCMInfo } from '../model/polkaholic/xcm';
import { Constants } from '../util/constants';
import {
    formatNumber,
    getBlockTimeFormatted,
    getCondensedAddress,
    getCondensedHash,
} from '../util/format';
import { hide, show } from '../util/ui-util';

/**
 * XCM transfer details board UI.
 */
interface UI {
    root: HTMLElement;
    close: HTMLElement;
    hash: HTMLElement;
    fromPara: HTMLElement;
    sender: HTMLElement;
    toPara: HTMLElement;
    recipient: HTMLElement;
    date: HTMLElement;
    amount: HTMLElement;
}

/**
 * Displays the details of an XCM transfer, as fetched from thje Polkaholic API.
 */
class XCMTransferDetailsBoard {
    private readonly ui: UI;
    private mouseIsInside: boolean = false;

    constructor() {
        this.ui = {
            root: <HTMLElement>document.getElementById('xcm-details-board'),
            close: <HTMLElement>document.getElementById('xcm-details-close'),
            hash: <HTMLElement>document.getElementById('xcm-details-hash'),
            fromPara: <HTMLElement>document.getElementById('xcm-details-from-para'),
            sender: <HTMLElement>document.getElementById('xcm-details-sender'),
            toPara: <HTMLElement>document.getElementById('xcm-details-to-para'),
            recipient: <HTMLElement>document.getElementById('xcm-details-recipient'),
            date: <HTMLElement>document.getElementById('xcm-details-date'),
            amount: <HTMLElement>document.getElementById('xcm-details-amount'),
        };
        setTimeout(() => {
            this.ui.close.onclick = () => {
                this.close();
            };
            this.ui.root.onmouseenter = () => {
                this.mouseIsInside = true;
            };
            this.ui.root.onmouseleave = () => {
                this.mouseIsInside = false;
            };
        }, 500);
    }

    getMouseIsInside(): boolean {
        return this.mouseIsInside;
    }

    display(transfer: XCMInfo) {
        const hash = transfer.origination.extrinsicHash;
        this.ui.hash.innerHTML = `<a href="https://polkaholic.io/tx/${hash}" target="_blank">${getCondensedHash(
            hash,
            Constants.HASH_TRIM_SIZE,
        )}</a>`;
        this.ui.fromPara.innerHTML = transfer.origination.chainName;
        this.ui.sender.innerHTML = `<a href="https://polkaholic.io/account/${
            transfer.origination.sender
        }" target="_blank">${getCondensedAddress(transfer.origination.sender)}</a>`;
        this.ui.toPara.innerHTML = transfer.destination.chainName;
        this.ui.recipient.innerHTML = `<a href="https://polkaholic.io/account/${
            transfer.destination.beneficiary
        }" target="_blank">${getCondensedAddress(transfer.destination.beneficiary)}</a>`;
        this.ui.date.innerHTML = getBlockTimeFormatted(new Date(transfer.origination.ts * 1000));
        const ticker = transfer.symbol ?? transfer.origination.txFeeSymbol;
        const formattedAmount = formatNumber(
            BigInt(Math.floor(transfer.origination.amountSent * 100)),
            2,
            2,
            ticker,
        );

        this.ui.amount.innerHTML = formattedAmount;

        show(this.ui.root);
    }

    close() {
        hide(this.ui.root);
    }
}

export { XCMTransferDetailsBoard };
