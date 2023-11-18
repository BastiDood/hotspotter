<script lang="ts">
    import { Geolocation, type Position } from '@capacitor/geolocation';
    import type { Coordinate } from 'ol/coordinate';
    import Feature from 'ol/Feature';
    import Map from './Map.svelte';
    import type { PageData } from './$types';
    import { Point } from 'ol/geom';
    import { fromLonLat } from 'ol/proj';
    import { onMount } from 'svelte';
    import { onNavigate } from '$app/navigation';

    function resolveCoords(coords?: Position['coords']): Coordinate {
        if (typeof coords === 'undefined') return [0, 0];
        const { latitude, longitude } = coords;
        return [longitude, latitude];
    }

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ markers, position } = data);
    $: center = fromLonLat(resolveCoords(position?.coords));
    $: radius = position?.coords.accuracy;

    let map = null as Map | null;
    $: if (map !== null && typeof markers !== 'undefined') {
        map.features.clear();
        map.features.extend(markers.map(pair => new Feature({ geometry: new Point(fromLonLat(pair)) })));
    }

    // eslint-disable-next-line init-declarations
    let id: string | undefined;

    onMount(async () => {
        id = await Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
            if (pos === null) return;
            position = pos;
        });
    });

    onNavigate(async () => {
        if (typeof id === 'undefined') return;
        await Geolocation.clearWatch({ id });
    });
</script>

<Map bind:this={map} zoom={15} {radius} {center} />
