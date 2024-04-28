<script lang="ts">
    import { ChartBar, Wifi } from '@steeze-ui/heroicons';
    import { CellType } from '$lib/models/api';
    import type { Coordinate } from 'ol/coordinate';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { View } from 'ol';
    import { writable } from 'svelte/store';

    import AgeSelect from './AgeSelect.svelte';
    import NetworkSelect from './NetworkSelect.svelte';
    import OperatorSelect from './OperatorSelect.svelte';

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
    <div class="col-start-1 row-start-3 flex items-center justify-self-start overflow-hidden rounded-xl">
        {#if $cell === CellType.WiFi}
            <div class="flex aspect-square size-8 items-center justify-center bg-[#ffffd4]/40">1</div>
            <div class="flex aspect-square size-8 items-center justify-center bg-[#fe9929]/40">
                <Icon src={Wifi} theme="mini" class="size-4" />
            </div>
            <div class="flex aspect-square size-8 items-center justify-center bg-[#993404]/40">30+</div>
        {:else}
            <div class="flex aspect-square size-8 items-center justify-center bg-[#ffffb2]/40">0</div>
            <div class="flex aspect-square size-8 items-center justify-center bg-[#fecc5c]/40">
                <Icon src={ChartBar} theme="mini" class="size-4" />
            </div>
            <div class="flex aspect-square size-8 items-center justify-center bg-[#fd8d3c]/40">
                <Icon src={ChartBar} theme="mini" class="size-4" />
            </div>
            <div class="flex aspect-square size-8 items-center justify-center bg-[#e31a1c]/40">4</div>
        {/if}
    </div>
    <p class="col-start-3 row-start-3 w-full self-end text-right">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="anchor pointer-events-auto"
            >OpenStreetMap</a
        > Contributors
    </p>
</div>
