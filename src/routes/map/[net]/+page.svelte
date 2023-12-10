<script lang="ts">
    import { Circle, Point } from 'ol/geom';
    import { onMount, tick } from 'svelte';
    import Error from '$lib/alerts/Error.svelte';
    import Feature from 'ol/Feature';
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';
    import type { PageData } from './$types';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { assert } from '$lib/assert';
    import { fromLonLat } from 'ol/proj';
    import { getLocation } from '$lib/plugins/Location';
    import { onNavigate } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ markers } = data);

    let map = null as Map | null;
    $: if (map !== null && typeof markers !== 'undefined') {
        map.features.clear();
        map.features.extend(
            markers.map(({ lon, lat }) => new Feature({ geometry: new Point(fromLonLat([lon, lat])) })),
        );
    }

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
