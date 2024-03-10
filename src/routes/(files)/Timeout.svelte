<script lang="ts">
    import Countdown from './Countdown.svelte';
    import UploadButton from './UploadButton.svelte';
    import { invalidateAll } from '$app/navigation';
    import { resetScanCount } from '$lib/plugins/Debounce';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;
    // eslint-disable-next-line init-declarations
    export let count: number;
    // eslint-disable-next-line init-declarations
    export let timestamp: Date;

    async function reset() {
        await resetScanCount();
        await invalidateAll();
    }
</script>

{#if count < 3}
    <UploadButton bind:disabled />
{:else}
    {@const end = timestamp.valueOf() + 120_000 - performance.timeOrigin}
    <Countdown {end} on:done={reset} />
{/if}
