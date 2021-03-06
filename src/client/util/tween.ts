import * as TWEEN from "@tweenjs/tween.js";

declare type EasingFunction = (amount: number) => number;

export function createTween<T, U>(
    property: T,
    targetProperties: U,
    curve: EasingFunction,
    durationMs: number,
    onStart?: () => void,
    onUpdate?: () => void,
    onComplete?: () => void
) {
    return new TWEEN.Tween(property)
        .to(targetProperties, durationMs)
        .easing(curve)
        .onStart(() => {
            if (onStart) {
                onStart();
            }
        })
        .onUpdate((_object, _elapsed) => {
            if (onUpdate) {
                onUpdate();
            }
        })
        .onComplete(() => {
            if (onComplete) {
                onComplete();
            }
        });
}
