<script>
    import { CodeBlock } from '@skeletonlabs/skeleton';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { page } from '$app/stores';
    $: ({ status, error } = $page);
</script>

<div class="space-y-4 p-4">
    {#if error === null}
        <ErrorAlert>
            <span><b>[{status}]:</b> An unknown error has been encountered.</span>
        </ErrorAlert>
    {:else}
        {@const { message, stack } = error}
        <ErrorAlert><span><b>[{status}]:</b> {message}</span></ErrorAlert>
        {#if typeof stack !== 'undefined'}
            <CodeBlock lang="text" code={stack} />
        {/if}
    {/if}
</div>
