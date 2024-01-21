<script context="module" lang="ts">
    const MAX_ACCESS_POINTS = 20;
    // TODO: Convert these to color arrays.
    const GRADIENT = [
        { color: '#edf8b150', legend: '1' },
        { color: '#7fcdbb50' },
        { color: '#2c7fb850', legend: `${MAX_ACCESS_POINTS}+` },
    ];
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
                const geometry = new Polygon([cellToBoundary(hex, true)]).transform('EPSG:4326', proj);
                const density = Math.min(count, MAX_ACCESS_POINTS) / MAX_ACCESS_POINTS;
                const color = GRADIENT[Math.floor(density * (GRADIENT.length - 1))]?.color;
                assert(typeof color !== 'undefined');
                return new Feature({ geometry, color });
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
    <div class="col-start-1 row-start-3 flex items-center gap-4 justify-self-start">
        <button
            class="variant-filled-primary btn-icon pointer-events-auto"
            on:click={({ currentTarget }) => refreshHexagons(currentTarget)}
            ><Icon src={ArrowPath} class="h-4" /></button
        >
        {#if $hex}
            <div class="flex h-10 overflow-hidden rounded-lg text-sm">
                {#each GRADIENT as { color, legend }, i (i)}
                    <div style:background-color={color} class="flex w-10 items-center justify-center">
                        {#if typeof legend !== 'undefined'}
                            {legend}
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <p class="col-start-3 row-start-3 w-full self-end text-right">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="anchor pointer-events-auto"
            >OpenStreetMap</a
        > Contributors
    </p>
</div>
