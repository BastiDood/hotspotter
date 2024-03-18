<script lang="ts">
    import Countdown from './Countdown.svelte';
    import ScanButton from './ScanButton.svelte';
    import { invalidateAll } from '$app/navigation';
    import { resetScanCount } from '$lib/plugins/Debounce';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;
    // eslint-disable-next-line init-declarations
    export let count: number;
    // eslint-disable-next-line init-declarations
    export let timestamp: Date;

    async function reset() {
        await resetScanCount(new Date());
        await invalidateAll();
    }
</script>

{#if count < 3}
    <ScanButton bind:disabled />
{:else}
    {@const end = timestamp.valueOf() + 120_000 - performance.timeOrigin}
    <Countdown {end} on:done={reset} />
{/if}
