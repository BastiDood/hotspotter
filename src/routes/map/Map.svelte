<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Map } from 'leaflet';
    import { assert } from '$lib/assert';

    let div = null as HTMLDivElement | null;
    let map = null as Map | null;

    onMount(async () => {
        await import('leaflet/dist/leaflet.css');
        const L = await import('leaflet');
        assert(div !== null);
        map = L.map(div).setView([14.599512, 120.984222], 5);
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
