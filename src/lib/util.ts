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

export function binarySearch(items: number[], target: number) {
    let size = items.length;
    let left = 0;
    let right = size;
    while (left < right) {
        const mid = left + Math.floor(size / 2);
        const value = items[mid];
        assert(typeof value !== 'undefined');
        if (target < value) right = mid;
        else if (target > value) left = mid + 1;
        else return mid;
        size = right - left;
    }
    assert(left <= items.length);
    return left;
}
