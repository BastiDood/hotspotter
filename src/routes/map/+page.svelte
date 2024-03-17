<script>
    import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';

    /** @param {number} code */
    function messageFromGpsErrorCode(code) {
        switch (code) {
            // eslint-disable-next-line no-undef
            case GeolocationPositionError.PERMISSION_DENIED:
                return 'Geolocation permissions denied.';
            // eslint-disable-next-line no-undef
            case GeolocationPositionError.POSITION_UNAVAILABLE:
                return 'Geolocation is unavailable.';
            // eslint-disable-next-line no-undef
            case GeolocationPositionError.TIMEOUT:
                return 'Geolocation query timed out.';
            default:
                return 'Unknown geolocation error.';
        }
    }

    /** @param {unknown} err */
    function messageFromError(err) {
        // eslint-disable-next-line no-undef
        if (err instanceof GeolocationPositionError) return messageFromGpsErrorCode(err.code);
        if (err instanceof Error) return `[${err.name}]: ${err.message}.`;
        throw err;
    }

    const toast = getToastStore();
    async function getCurrentPosition() {
        try {
            const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            return coords;
        } catch (err) {
            console.error(err);
            // eslint-disable-next-line no-undef
            const base = messageFromError(err);
            toast.trigger({
                message: `${base} Using default location...`,
                background: 'variant-filled-error',
            });
        }
        // Default location is UPD AECH
        return { latitude: 14.6486823, longitude: 121.0687212, accuracy: 0 };
    }
</script>

{#await getCurrentPosition()}
    <div class="flex h-full items-center justify-center">
        <ProgressRadial />
    </div>
{:then coords}
    <Map {coords} />
{:catch err}
    <ErrorAlert>{err}</ErrorAlert>
{/await}
