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
    $: map?.setZoom(zoom);
    $: marker?.setLatLng(coords);

    onMount(async () => {
        await import('leaflet/dist/leaflet.css');
        const L = await import('leaflet');

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

        assert(div !== null);
        map = L.map(div).setView(coords, zoom);
        marker = L.marker(coords, { icon }).addTo(map);

        map.addEventListener('zoom', ({ type, sourceTarget }) => {
            assert(type === 'zoom');
            assert(sourceTarget instanceof L.Map);
            zoom = sourceTarget.getZoom();
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
    });

    onDestroy(() => {
        marker?.remove();
        map?.remove();
        marker = null;
        map = null;
    });
</script>

<div bind:this={div} class="h-full"></div>
