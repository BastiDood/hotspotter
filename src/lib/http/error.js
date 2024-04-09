export class UnexpectedStatusCodeError extends Error {
    /** @param {number} code */
    constructor(code) {
        super(`unexpected status code [${code}]`);
    }
}

export class MalformedAuthorizationError extends Error {
    constructor() {
        super('malformed Authorization header');
    }
}

export class EmptyAuthorizationError extends Error {
    constructor() {
        super('empty Authorization header');
    }
}

export class BatchOperationError extends Error {
    constructor() {
        super('batch operation failed');
    }
}
