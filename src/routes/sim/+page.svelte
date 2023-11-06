<script>
    import DisplaySim from './DisplaySim.svelte';
    import DisplayStrength from './DisplayStrength.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo.ts';
</script>

{#await TelephonyInfo.getSim()}
    <ProgressBar />
{:then { networkType, carrierId, carrierName, operatorId, operatorName }}
    <DisplaySim {networkType} {carrierId} {carrierName} {operatorId} {operatorName} />
{:catch err}
    <Error>{err}</Error>
{/await}
{#await TelephonyInfo.getSignalStrength()}
    <ProgressBar />
{:then { timestamp, level }}
    {@const date = new Date(timestamp)}
    <DisplayStrength {date} {level} />
{:catch err}
    <Error>{err}</Error>
{/await}
