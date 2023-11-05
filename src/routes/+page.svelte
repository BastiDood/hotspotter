<script>
    import { array, parse } from 'valibot';
    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import DisplayLocationPermissions from './DisplayLocationPermissions.svelte';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import { LightSwitch } from '@skeletonlabs/skeleton';
    import { Network } from '$lib/model.js';
    import Warning from '$lib/alerts/Warning.svelte';
</script>

{#await Geolocation.requestPermissions({ permissions: ['location'] })}
    <Warning>Requesting location permissions...</Warning>
{:then { location, coarseLocation }}
    {#if location === 'granted' || coarseLocation === 'granted'}
        {#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
            <p>Loading...</p>
        {:then { timestamp, coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading } }}
            {@const date = new Date(timestamp)}
            <DisplayGeolocation
                {date}
                {latitude}
                {longitude}
                {accuracy}
                {altitude}
                {altitudeAccuracy}
                {speed}
                {heading}
            />
            {#await import('@awesome-cordova-plugins/wifi-wizard-2') then { WifiWizard2 }}
                {#await WifiWizard2.scan()}
                    <p>Scanning...</p>
                {:then payload}
                    {@const networks = parse(array(Network), payload)}
                    <DisplayNetworks {networks} />
                {:catch err}
                    <Error>{err}</Error>
                {/await}
            {/await}
        {:catch err}
            <Error>{err}</Error>
        {/await}
    {:else}
        <DisplayLocationPermissions {location} {coarseLocation} />
    {/if}
{/await}
<LightSwitch />
