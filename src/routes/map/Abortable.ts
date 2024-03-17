// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callback<T extends any[]> = (signal: AbortSignal, ...args: T) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function abortable<T extends any[]>(callback: Callback<T>) {
    let controller = null as AbortController | null;
    return async function (...args: T) {
        controller?.abort();
        controller = new AbortController();
        try {
            await callback(controller.signal, ...args);
        } catch (err) {
            // Only reset the controller if the error is unexpected.
            if (err instanceof DOMException && err.name === 'AbortError') return;
            // eslint-disable-next-line require-atomic-updates
            controller = null;
            throw err;
        }
    };
}
