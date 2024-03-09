<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import SyncButton from './SyncButton.svelte';
    import UploadButton from './UploadButton.svelte';

    import DisplayData from './DisplayData.svelte';
    import Success from '$lib/alerts/Success.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ files } = data);

    let disabled = false;
</script>

<div class="prose max-w-none space-y-4 p-4 dark:prose-invert">
    <div class="flex justify-center">
        <UploadButton bind:disabled />
    </div>
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
