<script>
    import Error from '$lib/alerts/Error.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo.ts';
    import Warning from '$lib/alerts/Warning.svelte';
</script>

<Error>TODO: Leaflet.js Map</Error>
{#await TelephonyInfo.getNetworkOperatorName()}
    <ProgressBar />
{:then { name }}
    <Warning>{name}</Warning>
{:catch err}
    <Error>{err}</Error>
{/await}
