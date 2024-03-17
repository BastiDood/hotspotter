<script lang="ts">
    import { ChartBar, Wifi } from '@steeze-ui/heroicons';
    import { CellType } from '$lib/models/api';
    import type { Coordinate } from 'ol/coordinate';
    import { Icon } from '@steeze-ui/svelte-icon';
    import NetworkSelect from './NetworkSelect.svelte';
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { View } from 'ol';
    import { writable } from 'svelte/store';

    // eslint-disable-next-line init-declarations
    export let center: Coordinate;

    /** Caller is responsible for disposing this {@linkcode View}. */
    export const view = new View({
        center,
        zoom: 14,
        maxZoom: 19,
        enableRotation: false,
        constrainResolution: true,
    });
    $: view.setCenter(center);

    /** Whether to keep the GPS watcher visible. */
    export const gps = writable(true);

    /** Whether to keep the hexagons visible. */
    export const hex = writable(true);

    /** The source of the hexagons. */
    export const cell = writable(CellType.WiFi);
</script>

<div class="pointer-events-none grid h-full grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 p-4 text-xs">
    <!-- FIXME: Reinstate Zoom Controls -->
    <div class="flex flex-col gap-4">
        <SlideToggle name="gps" size="sm" active="bg-primary-400" class="pointer-events-auto" bind:checked={$gps}
            >Geolocation</SlideToggle
        >
        <SlideToggle name="hex" size="sm" active="bg-primary-400" class="pointer-events-auto" bind:checked={$hex}
            >Hexagons</SlideToggle
        >
    </div>
    <div class="col-start-1 row-start-3 flex items-center justify-self-start overflow-hidden rounded-xl">
        {#if $hex}
            {#if $cell === CellType.WiFi}
                <div class="flex aspect-square size-8 items-center justify-center bg-[#ffffd4]/40">1</div>
                <div class="flex aspect-square size-8 items-center justify-center bg-[#fe9929]/40">
                    <Icon src={Wifi} theme="mini" class="size-4" />
                </div>
                <div class="flex aspect-square size-8 items-center justify-center bg-[#993404]/40">20+</div>
            {:else}
                <div class="flex aspect-square size-8 items-center justify-center bg-[#ffffd4]/40">0</div>
                <div class="flex aspect-square size-8 items-center justify-center bg-[#fed98e]/40">
                    <Icon src={ChartBar} theme="mini" class="size-4" />
                </div>
                <div class="flex aspect-square size-8 items-center justify-center bg-[#fe9929]/40">
                    <Icon src={ChartBar} theme="mini" class="size-4" />
                </div>
                <div class="flex aspect-square size-8 items-center justify-center bg-[#cc4c02]/40">4</div>
            {/if}
        {/if}
    </div>
    <div class="row-start 1 col-start-3">
        <NetworkSelect name="data" bind:value={$cell} />
    </div>
    <p class="col-start-3 row-start-3 w-full self-end text-right">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="anchor pointer-events-auto"
            >OpenStreetMap</a
        > Contributors
    </p>
</div>
