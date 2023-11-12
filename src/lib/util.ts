import { assert } from '$lib/assert';

type MaybeProduceFn<T, U> = (value: T) => NonNullable<U> | undefined;
export function* filterMap<T, U>(iter: Iterable<T>, filter: MaybeProduceFn<T, U>) {
    for (const value of iter) {
        const result = filter(value);
        if (typeof result === 'undefined') continue;
        yield result;
    }
}

// HACK: Remove this when `Promise.withResolvers` is well supported.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deferred<T, E = any>() {
    let resolve = null as ((reason: T | PromiseLike<T>) => void) | null;
    let reject = null as ((reason?: E) => void) | null;
    const promise = new Promise<T>((good, bad) => {
        resolve = good;
        reject = bad;
    });
    assert(resolve !== null);
    assert(reject !== null);
    return { promise, resolve, reject };
}
