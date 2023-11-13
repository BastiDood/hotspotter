<script lang="ts">
    import type { LatLngTuple, Map, Marker } from 'leaflet';
    import { onDestroy, onMount } from 'svelte';
    import { assert } from '$lib/assert';

    // eslint-disable-next-line init-declarations
    export let zoom: number;
    // eslint-disable-next-line init-declarations
    export let latitude: number;
    // eslint-disable-next-line init-declarations
    export let longitude: number;

    let div = null as HTMLDivElement | null;
    let map = null as Map | null;
    let marker = null as Marker | null;

    $: coords = [latitude, longitude] as LatLngTuple;
    $: map?.setView(coords, zoom);
    $: marker?.setLatLng(coords);

    onMount(async () => {
        assert(div !== null);
        await import('leaflet/dist/leaflet.css');
        const L = await import('leaflet');
        map = L.map(div);
        marker = L.marker(coords).addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
    });

    onDestroy(() => {
        map?.remove();
        map = null;
    });
</script>

<div bind:this={div} class="h-full"></div>
