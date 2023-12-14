<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { Circle } from 'ol/geom';
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { assert } from '$lib/assert';
    import { fromLonLat } from 'ol/proj';
    import { getLocation } from '$lib/plugins/Location';
    import { onNavigate } from '$app/navigation';

    let map = null as Map | null;

    // eslint-disable-next-line init-declarations
    let watcher: Promise<string> | undefined;
    // eslint-disable-next-line init-declarations
    let gps: Circle | null | undefined;

    onMount(async () => {
        // TODO: Reload page when permission state changes.
        const position = await getLocation();
        if (position === null) {
            gps = null;
            return;
        }

        const { longitude, latitude, accuracy } = position.coords;
        const coords = fromLonLat([longitude, latitude]);

        gps = new Circle(coords, accuracy);
        watcher = Geolocation.watchPosition({ enableHighAccuracy: true }, position => {
            if (position === null) return;
            const { longitude, latitude, accuracy } = position.coords;
            gps?.setCenterAndRadius(fromLonLat([longitude, latitude]), accuracy);
        });

        await tick();
        assert(map !== null);
        map.setViewCenter(coords);
    });

    onNavigate(async () => {
        if (typeof watcher === 'undefined') return;
        const id = await watcher;
        await Geolocation.clearWatch({ id });
    });
</script>

{#if typeof gps === 'undefined'}
    <ProgressBar />
{:else if gps === null}
    <Error>Location permissions denied.</Error>
{:else}
    <Map bind:this={map} {gps} />
{/if}
