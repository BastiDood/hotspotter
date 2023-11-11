type MaybeProduceFn<T, U> = (value: T) => NonNullable<U> | undefined;
export function* filterMap<T, U>(iter: Iterable<T>, filter: MaybeProduceFn<T, U>) {
    for (const value of iter) {
        const result = filter(value);
        if (typeof result === 'undefined') continue;
        yield result;
    }
}
