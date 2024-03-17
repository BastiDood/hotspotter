export type Callback = (signal: AbortSignal) => Promise<void>;
export function abortable(callback: Callback) {
    let controller = null as AbortController | null;
    return async function () {
        controller?.abort();
        controller = new AbortController();
        try {
            await callback(controller.signal);
        } catch (err) {
            // Only reset the controller if the error is unexpected.
            if (err instanceof DOMException && err.name === 'AbortError') return;
            // eslint-disable-next-line require-atomic-updates
            controller = null;
            throw err;
        }
    };
}
