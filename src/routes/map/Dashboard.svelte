<script lang="ts">
    import { CellType } from '$lib/models/api';
    import type { Coordinate } from 'ol/coordinate';
    import OpenDrawerButton from './OpenDrawerButton.svelte';
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { View } from 'ol';

    import * as Network from '$lib/controls/network';
    import * as Operator from '$lib/controls/operator';
    import * as Satellite from '$lib/controls/Satellite';

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
    const network = Network.get();

    /** Filter the data points by this age. */
    const operator = Operator.get();

    /** Whether to view the basemap in satellite view. */
    const satellite = Satellite.get();
</script>

<div class="pointer-events-none grid h-full grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 p-4 text-xs">
    <div class="col-span-full flex flex-col gap-4">
        <div class="space-y-2">
            <Network.Select name="data" bind:value={$network} />
            {#if $network !== CellType.WiFi}
                <Operator.Select name="operator" bind:value={$operator} />
            {/if}
        </div>
    </div>
    <div class="col-start-1 row-start-2">
        <SlideToggle name="satellite" active="bg-primary-600" class="pointer-events-auto" bind:checked={$satellite}
            >Satellite</SlideToggle
        >
    </div>
    <div class="col-start-1 row-start-3 flex gap-2">
        <OpenDrawerButton />
        <div class="flex items-center justify-self-start overflow-hidden rounded-xl">
            {#if $network === CellType.WiFi}
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
