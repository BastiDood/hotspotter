<script>
    import { ProgressBar, ProgressRadial } from '@skeletonlabs/skeleton';
    import { array, parse } from 'valibot';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Network } from '$lib/model.js';
</script>

{#await import('@awesome-cordova-plugins/wifi-wizard-2')}
    <ProgressRadial />
{:then { WifiWizard2 }}
    {#await WifiWizard2.scan()}
        <ProgressBar />
    {:then payload}
        {@const networks = parse(array(Network), payload).sort((a, b) => a.level - b.level)}
        <DisplayNetworks {networks} />
    {:catch err}
        <Error>{err}</Error>
    {/await}
{:catch err}
    <Error>{err}</Error>
{/await}
