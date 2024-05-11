import { ValiError } from 'valibot';
import { printIssues } from '$lib/error/valibot';

export function handleError({ error }) {
    if (error instanceof Error) {
        if (error instanceof ValiError) {
            const message = Array.from(printIssues(error.issues)).join('\n');
            return { message, stack: error.stack };
        }
        return error;
    }
}
