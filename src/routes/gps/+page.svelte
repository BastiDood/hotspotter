<script>
    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import DisplayLocationPermissions from './DisplayLocationPermissions.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import Warning from '$lib/alerts/Warning.svelte';
</script>

{#await Geolocation.requestPermissions({ permissions: ['location'] })}
    <Warning>Requesting location permissions...</Warning>
{:then { location, coarseLocation }}
    {#if location === 'granted' || coarseLocation === 'granted'}
        {#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
            <ProgressBar />
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
        {:catch err}
            <Error>{err}</Error>
        {/await}
    {:else}
        <DisplayLocationPermissions {location} {coarseLocation} />
    {/if}
{/await}
