export class AssertionError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'AssertionError';
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, msg: string = 'assertion failed'): asserts condition {
    if (!condition) throw new AssertionError(msg);
}
