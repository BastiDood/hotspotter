<script lang="ts">
    import { SlideToggle, getToastStore } from '@skeletonlabs/skeleton';
    import { assert } from '$lib/assert';
    import { onDestroy } from 'svelte';

    // eslint-disable-next-line no-undef
    let lock = null as WakeLockSentinel | null;
    let checked = false;
    let disabled = false;
    const toast = getToastStore();

    function reset() {
        lock = null;
        checked = false;
    }

    async function acquire() {
        assert(lock === null);
        // eslint-disable-next-line require-atomic-updates
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', reset, { once: true });
    }

    async function release() {
        assert(lock !== null);
        await lock.release();
        // eslint-disable-next-line require-atomic-updates
        lock = null;
    }

    async function onChange() {
        disabled = true;
        const handle = checked ? acquire : release;
        try {
            await handle();
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                toast.trigger({
                    message: `[${err.name}]: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return null;
            }
            throw err;
        } finally {
            disabled = false;
        }
    }

    onDestroy(async () => {
        if (lock === null) return;
        await lock.release();
    });
</script>

<SlideToggle name="wake-lock" size="lg" active="bg-tertiary-700" bind:checked bind:disabled on:change={onChange}
    >Keep Screen Awake</SlideToggle
>
