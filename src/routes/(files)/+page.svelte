<script>
    import ClearButton from './ClearButton.svelte';
    import DisplayData from './DisplayData.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import Success from '$lib/alerts/Success.svelte';
    import SyncButton from './SyncButton.svelte';
    import Timeout from './Timeout.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ cache, scan } = data);
    $: files = Object.entries(cache);

    let disabled = false;
</script>

<div class="prose max-w-none space-y-4 p-4 dark:prose-invert">
    {#if scan === null}
        <Error>Scanning is not supported on this platform.</Error>
    {:else}
        {@const { count, timestamp } = scan}
        <Timeout bind:disabled {count} {timestamp} />
        <p>{count} scans since {timestamp.toLocaleString()}.</p>
    {/if}
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
