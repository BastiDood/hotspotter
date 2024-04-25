import type { SchemaIssues } from 'valibot';
export function printIssues(issues: SchemaIssues) {
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
        console.error(`received ${received} in ${trace} for ${context}@${reason}`);
    }
}
