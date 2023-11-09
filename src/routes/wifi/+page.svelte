<script>
    import { array, parse } from 'valibot';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Network } from '$lib/models/wifi';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';
</script>

{#await WifiWizard2.scan()}
    <ProgressBar />
{:then payload}
    {@const networks = parse(array(Network), payload).sort((a, b) => a.level - b.level)}
    <DisplayNetworks {networks} />
{:catch err}
    <Error>{err}</Error>
{/await}
