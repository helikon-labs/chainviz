import { XCMInfo } from '../model/polkaholic/xcm';
import { Network, getNetworkPara } from '../model/substrate/network';
import { Para } from '../model/substrate/para';

interface UI {
    root: HTMLDivElement;
}

interface XCMTransferListDelegate {
    onClick(originExtrinsicHash: string): void;
    onMouseEnter(originExtrinsicHash: string): void;
    onMouseLeave(originExtrinsicHash: string): void;
}

class XCMTransferList {
    private readonly ui: UI;
    private readonly delegate: XCMTransferListDelegate;

    constructor(delegate: XCMTransferListDelegate) {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('xcm-transfer-list'),
        };
        this.delegate = delegate;
    }

    private getXCMTransferInnerHTML(
        relayChain: Network,
        originPara: Para | undefined,
        destinationPara: Para | undefined,
    ): string {
        let html = '<span class="xcm-title">XCM</span>';
        html += '<div>';
        if (originPara) {
            html += `<img class="xcm-chain-logo" src="/img/paras/${originPara.ui.logo}">`;
        } else {
            html += `<img class="xcm-chain-logo" src="/img/paras/${relayChain.logo}">`;
        }
        html += '<img class="xcm-arrow" src="/img/xcm-arrow.svg">';
        if (destinationPara) {
            html += `<img class="xcm-chain-logo" src="/img/paras/${destinationPara.ui.logo}">`;
        } else {
            html += `<img class="xcm-chain-logo" src="/img/paras/${relayChain.logo}">`;
        }
        html += '</div>';
        return html;
    }

    setOpacity(opacity: number) {
        this.ui.root.style.opacity = `${opacity}%`;
    }

    clear() {
        this.ui.root.innerHTML = '';
    }

    insertXCMTransfers(network: Network, xcmTransfers: XCMInfo[]) {
        for (let i = xcmTransfers.length - 1; i >= 0; i--) {
            const xcmTransfer = xcmTransfers[i];
            const transferDiv = document.getElementById(
                `xcm-transfer-${xcmTransfer.origination.extrinsicHash}`,
            );
            if (transferDiv) {
                continue;
            }
            const originPara = getNetworkPara(network, xcmTransfer.origination.paraID);
            const destionationPara = getNetworkPara(network, xcmTransfer.destination.paraID);
            this.insertXCMTransfer(
                xcmTransfer.origination.extrinsicHash,
                network,
                originPara,
                destionationPara,
            );
        }
    }

    removeXCMTransfers(xcmTransfers: XCMInfo[]) {
        for (const xcmTransfer of xcmTransfers) {
            const transferDiv = document.getElementById(
                `xcm-transfer-${xcmTransfer.origination.extrinsicHash}`,
            );
            transferDiv?.remove();
        }
    }

    insertXCMTransfer(
        originExtrinsicHash: string,
        relayChain: Network,
        originPara: Para | undefined,
        destinationPara: Para | undefined,
    ) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('xcm-transfer');
        messageDiv.id = `xcm-transfer-${originExtrinsicHash}`;
        messageDiv.innerHTML = this.getXCMTransferInnerHTML(
            relayChain,
            originPara,
            destinationPara,
        );
        if (this.ui.root.children.length == 0) {
            this.ui.root.appendChild(messageDiv);
        } else {
            this.ui.root.insertBefore(messageDiv, this.ui.root.children[0]);
        }

        setTimeout(() => {
            const messageDiv = document.getElementById(`xcm-transfer-${originExtrinsicHash}`);
            messageDiv?.addEventListener('click', (_event) => {
                this.delegate.onClick(originExtrinsicHash);
            });
            // mouse over :: call delegate
            messageDiv?.addEventListener('mouseenter', (_event) => {
                this.delegate.onMouseEnter(originExtrinsicHash);
            });
            messageDiv?.addEventListener('mouseleave', (_event) => {
                this.delegate.onMouseLeave(originExtrinsicHash);
            });
        }, 500);
    }
}

export { XCMTransferList, XCMTransferListDelegate };
