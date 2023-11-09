<script lang="ts">
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

    let networks = false as Awaited<ReturnType<typeof scan>> | boolean;

    const toast = getToastStore();
    async function refresh(button: HTMLButtonElement) {
        button.disabled = true;
        networks = true;
        try {
            networks = await scan();
        } catch (err) {
            networks = false;
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
        <span>Refresh</span>
    </button>
    {#if typeof networks === 'object'}
        <DisplayNetworks {networks} />
    {:else if networks}
        <ProgressBar />
    {/if}
</div>
