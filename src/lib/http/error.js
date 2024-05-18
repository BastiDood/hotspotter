export class ApiError extends Error {
    /** @param {string} [msg] */
    constructor(msg) {
        super(msg);
        this.name = 'ApiError';
    }
}

export class ProviderTimeoutError extends Error {
    constructor() {
        super('The hosting provider is unavailable or timed out.');
        this.name = 'ProviderTimeoutError';
    }
}

export class UnexpectedStatusCodeError extends ApiError {
    /** @param {number} code */
    constructor(code) {
        super(`Unexpected status code ${code} encountered.`);
        this.name = 'UnexpectedStatusCodeError';
    }
}

export class MalformedAuthorizationError extends ApiError {
    constructor() {
        super('The Authorization header is malformed.');
        this.name = 'MalformedAuthorizationError';
    }
}

export class EmptyAuthorizationError extends ApiError {
    constructor() {
        super('The Authorization header is empty.');
        this.name = 'EmptyAuthorizationError';
    }
}

export class BatchOperationError extends ApiError {
    constructor() {
        super('Failed to upload the readings in batch. The data is likely corrupted.');
        this.name = 'BatchOperationError';
    }
}
