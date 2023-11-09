<script>
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { array, parse } from 'valibot';
    import { ArrowPathIcon } from '@krowten/svelte-heroicons';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Network } from '$lib/models/wifi';
    import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';

    async function scan() {
        const results = await WifiWizard2.scan();
        return parse(array(Network), results).sort((a, b) => a.level - b.level);
    }

    let isLoading = false;
    let wifi = scan();

    const toast = getToastStore();
    async function refresh() {
        isLoading = true;
        wifi = scan();
        try {
            const payload = await wifi;
        } catch (err) {
            if (!(err instanceof Error)) throw err;
            toast.trigger({
                message: `${err.name}: ${err.message}`,
                background: 'variant-filled-error',
                autohide: false,
            });
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="space-y-4">
    <button type="button" class="variant-filled-primary btn" disabled={isLoading} on:click={refresh}>
        <ArrowPathIcon class="h-4" />
        <span>Refresh</span>
    </button>
    {#await wifi}
        <ProgressBar />
    {:then payload}
        {@const networks = parse(array(Network), payload).sort((a, b) => a.level - b.level)}
        <DisplayNetworks {networks} />
    {:catch err}
        <Error>{err}</Error>
    {/await}
</div>
