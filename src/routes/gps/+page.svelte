<script lang="ts">
    import { Geolocation, type Position } from '@capacitor/geolocation';
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { ArrowPathIcon } from '@krowten/svelte-heroicons';
    import DisplayGeolocation from './DisplayGeolocation.svelte';

    let position: Position | boolean = false;

    const toast = getToastStore();
    async function getCurrentPosition(button: HTMLButtonElement) {
        button.disabled = true;
        position = true;
        try {
            const { location, coarseLocation } = await Geolocation.requestPermissions({ permissions: ['location'] });
            if (location !== 'granted' && coarseLocation !== 'granted')
                throw new RangeError('Location permissions have been denied');
            position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        } catch (err) {
            position = false;
            if (!(err instanceof Error)) throw err;
            toast.trigger({
                message: `${err.name}: ${err.message}`,
                background: 'variant-filled-error',
                autohide: false,
            });
        } finally {
            button.disabled = false;
        }
    }
</script>

<section class="space-y-4">
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => getCurrentPosition(currentTarget)}>
        <ArrowPathIcon class="h-4" />
        <span>Refresh</span>
    </button>
    {#if typeof position === 'object'}
        {@const {
            timestamp,
            coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
        } = position}
        {@const date = new Date(timestamp)}
        <DisplayGeolocation {date} {latitude} {longitude} {accuracy} {altitude} {altitudeAccuracy} {speed} {heading} />
    {:else if position}
        <ProgressBar />
    {/if}
</section>
