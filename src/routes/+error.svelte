<script>
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { ValiError } from 'valibot';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    import { page } from '$app/stores';
    import { printIssues } from '$lib/error/valibot';
    $: ({ status, error } = $page);
</script>

<div class="space-y-4 p-4">
    {#if error === null}
        <ErrorAlert>
            <span><b>[{status}]:</b> An unknown error has been encountered.</span>
        </ErrorAlert>
    {:else if error instanceof ValiError}
        <ErrorAlert><span><b>[{status}]:</b> {error.message}</span></ErrorAlert>
        {#each Array.from(printIssues(error.issues)) as msg}
            <WarningAlert><span><b>[{status}]:</b> Schema validation failed because the app {msg}.</span></WarningAlert>
        {/each}
    {:else}
        <ErrorAlert><span><b>[{status}]:</b> {error.message}</span></ErrorAlert>
    {/if}
</div>
