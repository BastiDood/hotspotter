<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let end: number;

    const dispatch = createEventDispatcher<{ done: null }>();

    let id = null as number | null;
    let start = null as number | null;
    let curr = null as number | null;

    // eslint-disable-next-line no-undef
    function render(now: DOMHighResTimeStamp) {
        start ??= now;
        curr = Math.min(now, end);
        if (curr < end) id = requestAnimationFrame(render);
        else {
            dispatch('done');
            id = null;
        }
    }

    onMount(() => {
        id = requestAnimationFrame(render);
        return () => {
            if (id === null) return;
            cancelAnimationFrame(id);
            id = null;
            curr = null;
        };
    });
</script>

{#if start !== null && curr !== null}
    <ProgressBar transition="transition-none" min={start} value={curr} max={end} />
{/if}
