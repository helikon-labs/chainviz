import { EventBus } from '../src/client/event/event-bus';
import { describe, expect, test } from '@jest/globals';

interface EventObject {
    a: number;
    b: string;
    c: bigint;
}

describe('event bus', () => {
    test('pub/sub works', async () => {
        const eventBus = EventBus.getInstance();
        const eventName = 'some_event';
        const eventObject: EventObject = {
            a: 1,
            b: 'two',
            c: 3n,
        };
        let eventReceived = false;
        eventBus.register(eventName, (receivedEventObject: EventObject) => {
            eventReceived = eventObject == receivedEventObject;
        });
        eventBus.dispatch(eventName, eventObject);
        await new Promise((resolve) => setTimeout(resolve, 500));
        expect(eventReceived).toBeTruthy();
    });
});
