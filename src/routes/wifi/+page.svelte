<script lang="ts">
    import { addScanListener, startScan } from '$lib/plugins/WifiInfo';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { browser } from '$app/environment';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { onNavigate } from '$app/navigation';
    import { ArrowPath as src } from '@steeze-ui/heroicons';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ results } = data);
    $: networks = results ?? [];

    if (browser) {
        const listener = addScanListener(aps => (networks = aps));
        onNavigate(async () => {
            const handle = await listener;
            await handle.remove();
        });
    }

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
        <Icon {src} class="h-4" />
        <span>Scan</span>
    </button>
    <DisplayNetworks {networks} />
</div>
