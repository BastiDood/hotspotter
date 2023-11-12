<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { addScanListener, startScan } from '$lib/plugins/WifiInfo';
    import type { AccessPoint } from '$lib/models/wifi';
    import { ArrowPathIcon } from '@krowten/svelte-heroicons';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import type { Output } from 'valibot';
    import Success from '$lib/alerts/Success.svelte';
    import { onNavigate } from '$app/navigation';

    type AccessPoints = Output<typeof AccessPoint>[];
    let networks = [] as AccessPoints;
    function setNetworks(aps: AccessPoints) {
        networks = aps.sort((a, b) => b.rssi - a.rssi);
    }

    const listener = addScanListener(setNetworks);
    onNavigate(async () => {
        const handle = await listener;
        await handle.remove();
    });

    const toast = getToastStore();
    async function refresh(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            if (await startScan()) {
                toast.trigger({
                    message: 'Scan successfully requested.',
                    background: 'variant-filled-success',
                });
                return;
            }
            throw new RangeError('Scan request failed.');
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

<div class="space-y-4">
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => refresh(currentTarget)}>
        <ArrowPathIcon class="h-4" />
        <span>Scan</span>
    </button>
    {#await listener}
        <ProgressBar />
    {:then}
        <Success>Now listening for Wi-Fi updates...</Success>
        <DisplayNetworks {networks} />
    {:catch err}
        <Error>{err}</Error>
    {/await}
</div>
