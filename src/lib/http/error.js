export class UnexpectedStatusCodeError extends Error {
    /** @param {number} code */
    constructor(code) {
        super(`unexpected status code [${code}]`);
    }
}
