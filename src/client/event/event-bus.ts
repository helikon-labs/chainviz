/**
 * Typescript event bus implementation.
 * From https://github.com/luixaviles/event-bus-typescript.
 * Details https://www.thisdot.co/blog/how-to-implement-an-event-bus-in-typescript/.
 */

export interface Registry {
    unregister: () => void;
}

export interface Callable {
    [key: string]: Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type
}

export interface Subscriber {
    [key: string]: Callable;
}

export interface IEventBus {
    dispatch<T>(event: string, arg?: T): void;
    register(event: string, callback: Function): Registry; // eslint-disable-line @typescript-eslint/no-unsafe-function-type
}

export class EventBus implements IEventBus {
    private subscribers: Subscriber;
    private static nextId = 0;
    private static instance?: EventBus = undefined;

    private constructor() {
        this.subscribers = {};
    }

    public static getInstance(): EventBus {
        if (this.instance === undefined) {
            this.instance = new EventBus();
        }

        return this.instance;
    }

    public dispatch<T>(event: string, arg?: T): void {
        const subscriber = this.subscribers[event];
        if (subscriber === undefined) {
            return;
        }
        Object.keys(subscriber).forEach((key) => subscriber[key](arg));
    }

    // prettier-ignore
    public register(event: string, callback: Function): Registry { // eslint-disable-line @typescript-eslint/no-unsafe-function-type
        const id = this.getNextId();
        if (!this.subscribers[event]) this.subscribers[event] = {};

        this.subscribers[event][id] = callback;

        return {
            unregister: () => {
                delete this.subscribers[event][id];
                if (Object.keys(this.subscribers[event]).length === 0)
                    delete this.subscribers[event];
            },
        };
    }

    private getNextId(): number {
        return EventBus.nextId++;
    }
}
