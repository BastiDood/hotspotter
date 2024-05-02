<script lang="ts">
    import { CellType } from '$lib/models/api';
    import type { Coordinate } from 'ol/coordinate';
    import { View } from 'ol';
    import { writable } from 'svelte/store';

    import AgeSelect from './AgeSelect.svelte';
    import NetworkSelect from './NetworkSelect.svelte';
    import OperatorSelect from './OperatorSelect.svelte';

    import CellLegend from './CellLegend.svelte';
    import WifiLegend from './WifiLegend.svelte';

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

    /** The source of the hexagons. */
    export const cell = writable(CellType.WiFi);

    /** Filter the data points by this age. */
    export const age = writable(7 as 7 | 14 | 28 | null);

    /** Filter the data points by this age. */
    export const operator = writable(null as number | null);
</script>

<div class="pointer-events-none grid h-full grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 p-4 text-xs">
    <div class="col-span-full flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-2">
            <NetworkSelect name="data" bind:value={$cell} />
            <AgeSelect name="age" bind:value={$age} />
            {#if $cell !== CellType.WiFi}
                <div class="col-span-full"><OperatorSelect name="operator" bind:value={$operator} /></div>
            {/if}
        </div>
    </div>
    <div class="col-start-1 row-start-3 flex gap-2">
        <div class="flex items-center justify-self-start overflow-hidden rounded-xl">
            {#if $cell === CellType.WiFi}
                <WifiLegend />
            {:else}
                <CellLegend />
            {/if}
        </div>
    </div>
    <p class="col-start-3 row-start-3 w-full self-end text-right">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="anchor pointer-events-auto"
            >OpenStreetMap</a
        > Contributors
    </p>
</div>
