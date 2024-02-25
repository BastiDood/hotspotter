<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import Path from 'path-browserify';
    import SyncButton from './SyncButton.svelte';
    import UploadButton from './UploadButton.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ files } = data);

    let disabled = false;
</script>

<div class="prose max-w-none dark:prose-invert">
    <div class="flex justify-center">
        <UploadButton bind:disabled />
    </div>
    {#if files.length !== 0}
        <h1 class="h1">Readings</h1>
        <ul class="list">
            {#each files as { path }}
                {@const { name } = Path.parse(path)}
                <li>{name}</li>
            {/each}
        </ul>
        <SyncButton bind:disabled />
        <ClearButton bind:disabled />
    {/if}
</div>
