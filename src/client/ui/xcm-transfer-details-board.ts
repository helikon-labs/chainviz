import { XCMInfo } from '../model/polkaholic/xcm';
import { Constants } from '../util/constants';
import { getBlockTimeFormatted, getCondensedAddress, getCondensedHash } from '../util/format';
import { hide, show } from '../util/ui-util';

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

class XCMTransferDetailsBoard {
    private readonly ui: UI;

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
            this.ui.close.addEventListener('click', (_event) => {
                this.close();
            });
        }, 500);
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
        this.ui.amount.innerHTML = `${transfer.origination.amountSent} ${ticker}`;

        show(this.ui.root);
    }

    close() {
        hide(this.ui.root);
    }
}

export { XCMTransferDetailsBoard };
