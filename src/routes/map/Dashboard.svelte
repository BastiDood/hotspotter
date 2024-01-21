<script context="module" lang="ts">
    export const MAX_ACCESS_POINTS = 20;
</script>

<script lang="ts">
    import { Feature, View } from 'ol';
    import { ArrowPath } from '@steeze-ui/heroicons';
    import type { Coordinate } from 'ol/coordinate';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Polygon } from 'ol/geom';
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { assert } from '$lib/assert';
    import { cellToBoundary } from 'h3-js';
    import { createEventDispatcher } from 'svelte';
    import { fetchHexagonAccessPoints } from '$lib/http';
    import { transformExtent } from 'ol/proj';
    import { writable } from 'svelte/store';

    // eslint-disable-next-line init-declarations
    export let center: Coordinate;

    /** Caller is responsible for disposing this {@linkcode View}. */
    export const view = new View({ center, zoom: 7, maxZoom: 22 });
    $: view.setCenter(center);

    /** Whether to keep the GPS watcher visible. */
    export const gps = writable(true);

    /** Whether to keep the hexagons visible. */
    export const hex = writable(true);

    /** Base URL for {@linkcode fetch}. */
    // eslint-disable-next-line init-declarations
    export let base: URL;

    const dispatch = createEventDispatcher<{ data: Feature[] }>();
    async function refreshHexagons(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const proj = view.getProjection();
            const [minX, minY, maxX, maxY, ...rest] = transformExtent(view.calculateExtent(), proj, 'EPSG:4326');

            assert(rest.length === 0);
            assert(typeof minX !== 'undefined');
            assert(typeof minY !== 'undefined');
            assert(typeof maxX !== 'undefined');
            assert(typeof maxY !== 'undefined');

            const hexes = await fetchHexagonAccessPoints(base, minX, minY, maxX, maxY);
            const data = Object.entries(hexes).map(([hex, count]) => {
                const density = Math.min(count, MAX_ACCESS_POINTS) / MAX_ACCESS_POINTS;
                const geometry = new Polygon([cellToBoundary(hex, true)]).transform('EPSG:4326', proj);
                return new Feature({ geometry, density });
            });
            dispatch('data', data);
        } finally {
            button.disabled = false;
        }
    }
</script>

<div class="pointer-events-none grid h-full grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 p-4">
    <!-- FIXME: Reinstate Zoom Controls -->
    <div class="flex flex-col gap-4">
        <SlideToggle name="gps" size="sm" active="bg-primary-400" class="pointer-events-auto" bind:checked={$gps}
            >Geolocation</SlideToggle
        >
        <SlideToggle name="hex" size="sm" active="bg-primary-400" class="pointer-events-auto" bind:checked={$hex}
            >Incidents</SlideToggle
        >
    </div>
    <button
        class="variant-filled-primary btn-icon pointer-events-auto col-start-1 row-start-3 flex items-center gap-4 justify-self-start"
        on:click={({ currentTarget }) => refreshHexagons(currentTarget)}><Icon src={ArrowPath} class="h-4" /></button
    >
    <p class="col-start-3 row-start-3 w-full self-end text-right">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="anchor pointer-events-auto"
            >OpenStreetMap</a
        > Contributors
    </p>
</div>
