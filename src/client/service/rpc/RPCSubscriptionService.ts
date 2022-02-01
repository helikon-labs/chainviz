import ReconnectingWebSocket from 'reconnecting-websocket';
import camelcaseKeysDeep = require('camelcase-keys-deep');

class RPCRequest {
    id: number;
    jsonrpc: string;
    method: string;
    params: any[];

    constructor(
        id: number,
        method: string,
        params: any[]
    ) {
        this.id = id;
        this.jsonrpc = "2.0";
        this.method = method;
        this.params = params;
    }
}

interface RPCSubscriptionServiceListener<T> {
    onConnected(): void;
    onSubscribed(subscriptionId: number): void;
    onUnsubscribed(subscriptionId: number): void;
    onDisconnected(): void;
    onUpdate(update: T): void;
    onError(code: number, message: string): void;
}

class RPCSubscriptionService<T> {
    url: string;
    subscribeMethod: string;
    unsubscribeMethod: string;
    listener: RPCSubscriptionServiceListener<T>;
    connection?: ReconnectingWebSocket = undefined;
    rpcId: number = 0;
    subscriptionId: number = 0;

    constructor(
        url: string,
        subscribeMethod: string,
        unsubscribeMethod: string,
        listener: RPCSubscriptionServiceListener<T>
    ) {
        this.url = url;
        this.subscribeMethod = subscribeMethod;
        this.unsubscribeMethod = unsubscribeMethod;
        this.listener = listener;
    }

    connect() {
        this.connection = new ReconnectingWebSocket(
            this.url,
            [],
            /*{ WebSocket: WebSocket }*/
        );
        this.connection.onopen = () => {
            this.onOpen();
        };
        this.connection.onerror = (error) => {
            this.onError(error.message);
        }
        this.connection.onmessage = (message) => {
            this.onMessage(message);
        } 
        this.connection.onclose = () => {
            this.onClose();
        }
    }

    disconnect() {
        this.connection?.close();
    }

    subscribe() {
        this.rpcId = Math.round(Math.random() * 1_000_000_000)
        const request = new RPCRequest(
            this.rpcId,
            this.subscribeMethod,
            []
        );
        this.connection!.send(JSON.stringify(request));
    }

    unsubscribe() {
        const request = new RPCRequest(
            this.rpcId,
            this.unsubscribeMethod,
            [this.subscriptionId]
        );
        this.connection!.send(JSON.stringify(request));
    }

    onOpen() {
        this.listener.onConnected();
    }

    onError(message: string) {
        this.listener.onError(
            0,
            message
        );
    }

    onMessage(event: MessageEvent) {
        const json = JSON.parse(event.data);
        if (json.hasOwnProperty("result")) {
            if (isNaN(json["result"])) {
                this.listener.onUnsubscribed(this.subscriptionId);
                this.subscriptionId = 0;
            } else {
                this.subscriptionId = json["result"];
                this.listener.onSubscribed(this.subscriptionId);
            }
        } else if (json.hasOwnProperty("params")) {
            const update: T = camelcaseKeysDeep(
                json["params"]["result"]
            ) as T;
            this.listener.onUpdate(update);
        } else if (json.hasOwnProperty("error")) {
            this.listener.onError(
                json["error"]["code"],
                json["error"]["message"]
            )
        }
    }

    onClose() {
        this.listener.onDisconnected();
    }

}

export { 
    RPCSubscriptionService,
    RPCSubscriptionServiceListener
};