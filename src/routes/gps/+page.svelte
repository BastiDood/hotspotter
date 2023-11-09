<script lang="ts">
    import { Geolocation, type Position } from '@capacitor/geolocation';
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { ArrowPathIcon } from '@krowten/svelte-heroicons';
    import DisplayGeolocation from './DisplayGeolocation.svelte';

    let position = null as Position | null;
    let isLoading = false;

    const toast = getToastStore();
    async function getCurrentPosition() {
        isLoading = true;
        try {
            const { location, coarseLocation } = await Geolocation.requestPermissions({ permissions: ['location'] });
            if (location !== 'granted' && coarseLocation !== 'granted')
                throw new RangeError('Location permissions have been denied');
            position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        } catch (err) {
            if (!(err instanceof Error)) throw err;
            toast.trigger({
                message: `${err.name}: ${err.message}`,
                background: 'variant-filled-error',
                autohide: false,
            });
        } finally {
            isLoading = false;
        }
    }
</script>

<section class="space-y-4">
    <button type="button" class="variant-filled-primary btn" disabled={isLoading} on:click={getCurrentPosition}>
        <ArrowPathIcon class="h-4" />
        <span>Refresh</span>
    </button>
    {#if isLoading}
        <ProgressBar />
    {/if}
    {#if position !== null}
        {@const {
            timestamp,
            coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
        } = position}
        {@const date = new Date(timestamp)}
        <DisplayGeolocation {date} {latitude} {longitude} {accuracy} {altitude} {altitudeAccuracy} {speed} {heading} />
    {/if}
</section>
