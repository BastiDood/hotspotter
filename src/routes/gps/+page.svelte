<script lang="ts">
    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { browser } from '$app/environment';
    import { fetchCellScore } from '$lib/http';
    import { onNavigate } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ url, position } = data);

    if (browser) {
        const listener = Geolocation.watchPosition({ enableHighAccuracy: true }, pos => (position = pos));
        onNavigate(async () => {
            const id = await listener;
            await Geolocation.clearWatch({ id });
        });
    }
</script>

{#if typeof url !== 'undefined' && position !== null}
    {@const {
        timestamp,
        coords: { longitude, latitude, accuracy, altitude, altitudeAccuracy, speed, heading },
    } = position}
    {@const date = new Date(timestamp)}
    {#await fetchCellScore(url, longitude, latitude)}
        <ProgressBar />
    {:then score}
        <div class="card p-8">Initial score is {score}.</div>
    {:catch err}
        <Error>{err}</Error>
    {/await}
    <DisplayGeolocation {date} {longitude} {latitude} {accuracy} {altitude} {altitudeAccuracy} {speed} {heading} />
{/if}
