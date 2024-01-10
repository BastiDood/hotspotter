<script lang="ts">
    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
</script>

{#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
    <div class="flex h-full items-center justify-center">
        <ProgressRadial />
    </div>
{:then { timestamp, coords: { longitude, latitude, accuracy, altitude, altitudeAccuracy, speed, heading } }}
    {@const date = new Date(timestamp)}
    <DisplayGeolocation {date} {longitude} {latitude} {accuracy} {altitude} {altitudeAccuracy} {speed} {heading} />
{:catch err}
    <!-- eslint-disable-next-line no-undef -->
    {#if err instanceof GeolocationPositionError}
        {@const { code, message } = err}
        <Error>[{code}]: {message}</Error>
    {:else}
        <Error>{err}</Error>
    {/if}
{/await}
