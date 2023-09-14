import ReconnectingWebSocket from 'reconnecting-websocket';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import ws from 'ws';

/**
 * JSON-RPC 2.0 request.
 */
class RPCRequest {
    id: number;
    jsonrpc: string;
    method: string;
    params: unknown[];

    constructor(id: number, method: string, params: unknown[]) {
        this.id = id;
        this.jsonrpc = '2.0';
        this.method = method;
        this.params = params;
    }
}

/**
 * JSON-RPC WS service listener interface.
 */
interface RPCSubscriptionServiceListener<T> {
    onConnected(): void;
    onSubscribed(subscriptionId: number): void;
    onUnsubscribed(subscriptionId: number): void;
    onDisconnected(): void;
    onUpdate(update: T): void;
    onError(code: number, message: string): void;
}

/**
 * JSON-RPC WS service state.
 */
enum RPCSubscriptionServiceState {
    NotConnected,
    Connected,
    Subscribed,
    Error,
}

/**
 * JSON-RPC service client generic class for SubVT WS services. `T` is the response type.
 */
class RPCSubscriptionService<T> {
    private readonly url: string;
    private readonly subscribeMethod: string;
    private readonly unsubscribeMethod: string;
    private readonly listener: RPCSubscriptionServiceListener<T>;
    private connection?: ReconnectingWebSocket = undefined;
    private rpcId = 0;
    private subscriptionId = 0;
    private state: RPCSubscriptionServiceState;

    constructor(
        url: string,
        subscribeMethod: string,
        unsubscribeMethod: string,
        listener: RPCSubscriptionServiceListener<T>,
    ) {
        this.url = url;
        this.subscribeMethod = subscribeMethod;
        this.unsubscribeMethod = unsubscribeMethod;
        this.listener = listener;
        this.state = RPCSubscriptionServiceState.NotConnected;
    }

    private onOpen() {
        this.state = RPCSubscriptionServiceState.Connected;
        this.listener.onConnected();
    }

    private onError(message: string) {
        this.state = RPCSubscriptionServiceState.Error;
        this.listener.onError(0, message);
    }

    private onMessage(event: MessageEvent) {
        const json = JSON.parse(event.data);
        if (Object.prototype.hasOwnProperty.call(json, 'result')) {
            if (isNaN(parseFloat(json['result']))) {
                this.state = RPCSubscriptionServiceState.Connected;
                this.listener.onUnsubscribed(this.subscriptionId);
                this.subscriptionId = 0;
            } else {
                this.state = RPCSubscriptionServiceState.Subscribed;
                this.subscriptionId = json['result'];
                this.listener.onSubscribed(this.subscriptionId);
            }
        } else if (Object.prototype.hasOwnProperty.call(json, 'params')) {
            const update: T = camelcaseKeysDeep(json['params']['result']) as T;
            this.listener.onUpdate(update);
        } else if (Object.prototype.hasOwnProperty.call(json, 'error')) {
            this.listener.onError(json['error']['code'], json['error']['message']);
        }
    }

    private onClose() {
        this.listener.onDisconnected();
    }

    connect() {
        if (typeof window === 'undefined') {
            this.connection = new ReconnectingWebSocket(this.url, [], {
                WebSocket: ws,
                connectionTimeout: 5000,
            });
        } else {
            this.connection = new ReconnectingWebSocket(this.url, [], {
                connectionTimeout: 5000,
            });
        }
        this.connection.onopen = () => {
            this.onOpen();
        };
        this.connection.onerror = (error) => {
            this.onError(error.message);
        };
        this.connection.onmessage = (message) => {
            this.onMessage(message);
        };
        this.connection.onclose = () => {
            this.onClose();
        };
    }

    disconnect() {
        this.connection?.close();
    }

    subscribe() {
        this.rpcId = Math.round(Math.random() * 1_000_000_000);
        const request = new RPCRequest(this.rpcId, this.subscribeMethod, []);
        this.connection?.send(JSON.stringify(request));
    }

    unsubscribe() {
        const request = new RPCRequest(this.rpcId, this.unsubscribeMethod, [this.subscriptionId]);
        this.connection?.send(JSON.stringify(request));
    }

    getState(): RPCSubscriptionServiceState {
        return this.state;
    }
}

export { RPCSubscriptionService, RPCSubscriptionServiceListener, RPCSubscriptionServiceState };
