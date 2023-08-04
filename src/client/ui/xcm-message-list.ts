import { Network } from '../model/substrate/network';
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
        let html = '';
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
        return html;
    }

    clear() {
        this.ui.root.innerHTML = '';
    }

    insertMessage(
        originExtrinsicHash: string,
        relayChain: Network,
        originPara: Para | undefined,
        destinationPara: Para | undefined,
    ) {
        const existingMessageDiv = document.getElementById(`xcm-message-${originExtrinsicHash}`);
        if (existingMessageDiv) {
            // ignore duplicates
            return;
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('xcm-message');
        messageDiv.id = `xcm-message-${originExtrinsicHash}`;
        messageDiv.innerHTML = this.getMessageInnerHTML(relayChain, originPara, destinationPara);
        if (this.ui.root.children.length == 1) {
            this.ui.root.appendChild(messageDiv);
        } else {
            this.ui.root.insertBefore(
                messageDiv,
                this.ui.root.children[this.ui.root.children.length - 1],
            );
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
