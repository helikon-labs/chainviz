import * as TWEEN from '@tweenjs/tween.js';

declare type EasingFunction = (amount: number) => number;

export function createTween<T, U>(
    property: T,
    targetProperties: U,
    curve: EasingFunction,
    durationMs: number,
    onStart?: () => void,
    onComplete?: () => void,
) {
    return new TWEEN.Tween(property).to(
        targetProperties,
        durationMs,
    ).easing(curve).onStart(() => {
        if (onStart) {
            onStart();
        }
    }).onComplete(() => {
        if (onComplete) {
            onComplete();
        }
    });
}