import type { SchemaIssues } from 'valibot';

export class Context {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        public received: string,
        public trace: string,
        public context: string,
        public reason: string,
    // eslint-disable-next-line no-empty-function
    ) {}
    [Symbol.toPrimitive](hint: string) {
        if (hint !== 'string') throw new TypeError('context can only be converted to strings');
        return `received ${this.received} in ${this.trace} for ${this.context}@${this.reason}`;
    }
}

export function* printIssues(issues: SchemaIssues) {
    for (const { reason, context, received, path } of issues) {
        const trace =
            path
                ?.map(path => {
                    switch (path.type) {
                        case 'object':
                            return path.key;
                        case 'array':
                        case 'tuple':
                        case 'set':
                        case 'record':
                            return path.key.toString();
                        case 'map':
                        case 'unknown':
                        default:
                            return path.key instanceof Object ? path.key.toString() : '<?>';
                    }
                })
                .join('.') || '<?>';
        yield new Context(received, trace, context, reason);
    }
}
