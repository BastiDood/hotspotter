export class ApiError extends Error {
    /** @param {string} [msg] */
    constructor(msg) {
        super(msg);
        this.name = 'ApiError';
    }
}

export class UnexpectedStatusCodeError extends ApiError {
    /** @param {number} code */
    constructor(code) {
        super(`Unexpected status code ${code} encountered.`);
    }
}

export class MalformedAuthorizationError extends ApiError {
    constructor() {
        super('The Authorization header is malformed.');
    }
}

export class EmptyAuthorizationError extends ApiError {
    constructor() {
        super('The Authorization header is empty.');
    }
}

export class BatchOperationError extends ApiError {
    constructor() {
        super('Failed to upload the readings in batch. The data is likely corrupted.');
    }
}
