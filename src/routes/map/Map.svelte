<script lang="ts">
    import type { LatLngTuple, Map, Marker } from 'leaflet';
    import { onDestroy, onMount } from 'svelte';
    import { assert } from '$lib/assert';
    import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
    import iconUrl from 'leaflet/dist/images/marker-icon.png';
    import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

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

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const icon = L.icon({
            iconUrl,
            iconRetinaUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
        });

        marker = L.marker(coords, { icon }).addTo(map);
    });

    onDestroy(() => {
        map?.remove();
        map = null;
    });
</script>

<div bind:this={div} class="h-full"></div>
