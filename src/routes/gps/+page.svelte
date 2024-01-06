<script lang="ts">
    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import { browser } from '$app/environment';
    import { onNavigate } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ position } = data);

    if (browser) {
        const listener = Geolocation.watchPosition({ enableHighAccuracy: true }, pos => (position = pos));
        onNavigate(async () => {
            const id = await listener;
            await Geolocation.clearWatch({ id });
        });
    }
</script>

{#if position !== null}
    {@const {
        timestamp,
        coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
    } = position}
    {@const date = new Date(timestamp)}
    <DisplayGeolocation {date} {latitude} {longitude} {accuracy} {altitude} {altitudeAccuracy} {speed} {heading} />
{/if}
