import { XCMInfo } from '../model/polkaholic/xcm';
import { Network, getNetworkPara } from '../model/substrate/network';
import { Para } from '../model/substrate/para';

interface UI {
    root: HTMLDivElement;
}

class XCMMessageList {
    private readonly ui: UI;

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('xcm-message-list'),
        };
    }

    private getMessageInnerHTML(
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

    inserXCMTransfers(network: Network, xcmTransfers: XCMInfo[]) {
        for (let i = xcmTransfers.length - 1; i >= 0; i--) {
            const xcmTransfer = xcmTransfers[i];
            const originPara = getNetworkPara(network, xcmTransfer.origination.paraID);
            const destionationPara = getNetworkPara(network, xcmTransfer.destination.paraID);
            this.insertMessage(
                xcmTransfer.origination.extrinsicHash,
                network,
                originPara,
                destionationPara,
            );
        }
    }

    insertMessage(
        originExtrinsicHash: string,
        relayChain: Network,
        originPara: Para | undefined,
        destinationPara: Para | undefined,
    ) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('xcm-message');
        messageDiv.id = `xcm-message-${originExtrinsicHash}`;
        messageDiv.innerHTML = this.getMessageInnerHTML(relayChain, originPara, destinationPara);
        if (this.ui.root.children.length == 0) {
            this.ui.root.appendChild(messageDiv);
        } else {
            this.ui.root.insertBefore(messageDiv, this.ui.root.children[0]);
        }

        setTimeout(() => {
            const messageDiv = document.getElementById(`xcm-message-${originExtrinsicHash}`);
            const url = `https://polkaholic.io/tx/${originExtrinsicHash}`;
            messageDiv?.addEventListener('click', (_event) => {
                window.open(url);
            });
        }, 500);
    }
}

export { XCMMessageList };
