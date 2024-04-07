<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import DisplayData from './DisplayData.svelte';
    import Success from '$lib/alerts/Success.svelte';
    import SyncButton from './SyncButton.svelte';

    import { clearWatch, startWatch } from '$lib/plugins/Loop';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';
    import { startScan } from '$lib/plugins/WifiInfo';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ cache } = data);
    $: files = Object.entries(cache).map(([now, value]) => ({ now: new Date(parseInt(now, 10)), ...value }));

    let disabled = false;

    const toast = getToastStore();
    async function request() {
        disabled = true;
        try {
            if (await startScan()) return;
            toast.trigger({
                message:
                    'Wi-Fi scanning failed. This may be due to permission errors, throttling, or disabled Wi-Fi radios.',
                background: 'variant-filled-error',
            });
        } finally {
            disabled = false;
        }
    }

    onMount(() => {
        const id = startWatch(data => (files = [...files, data])).catch(err => {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            console.error(err);
            throw err;
        });
        return async () => await clearWatch(await id);
    });
</script>

<div class="prose max-w-none space-y-4 p-4 dark:prose-invert">
    <button class="variant-filled-primary btn w-full" on:click={request}>Request Scan</button>
    <hr />
    <h3 class="h3">Cached Readings</h3>
    {#if files.length === 0}
        <Success>All readings synchronized. &#x1F389;</Success>
    {:else}
        <SyncButton bind:disabled />
        <ClearButton bind:disabled />
        <DisplayData {files} />
    {/if}
</div>
