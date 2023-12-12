<script lang="ts">
    import 'ol/ol.css';
    import { onDestroy, onMount } from 'svelte';
    import type { Circle } from 'ol/geom';
    import Collection from 'ol/Collection';
    import type { Coordinate } from 'ol/coordinate';
    import Feature from 'ol/Feature';
    import Fill from 'ol/style/Fill';
    import Map from 'ol/Map';
    import OpenStreetMap from 'ol/source/OSM';
    import Stroke from 'ol/style/Stroke';
    import Style from 'ol/style/Style';
    import TileLayer from 'ol/layer/WebGLTile';
    import VectorLayer from 'ol/layer/Vector';
    import VectorSource from 'ol/source/Vector';
    import View from 'ol/View';
    import { assert } from '$lib/assert';
    import { modeCurrent } from '@skeletonlabs/skeleton';

    let target = null as HTMLDivElement | null;
    let map = null as Map | null;

    const gpsFeature = new Feature<Circle>();
    gpsFeature.setStyle(
        new Style({
            fill: new Fill({ color: '#4f46e566' }),
            stroke: new Stroke({ color: '#0ea5e988', width: 4 }),
        }),
    );

    // eslint-disable-next-line init-declarations
    export let gps: Circle;
    $: gpsFeature.setGeometry(gps);

    let view = null as View | null;
    export function setViewCenter(coords: Coordinate) {
        view?.setCenter(coords);
    }

    const osmLayer = new TileLayer({ preload: Infinity });
    $: tileUrl = $modeCurrent
        ? 'https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
        : 'https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{scale}.png';
    $: osmLayer.setSource(new OpenStreetMap({ url: tileUrl }));

    /** Data points for the readings. */
    export const features = new Collection<Feature>();
    onMount(() => {
        assert(target !== null);
        view = new View({ zoom: 15, enableRotation: false });
        map = new Map({
            target,
            view,
            layers: [
                osmLayer,
                new VectorLayer({ source: new VectorSource({ features }) }),
                new VectorLayer({ source: new VectorSource({ features: new Collection([gpsFeature]) }) }),
            ],
        });
    });

    onDestroy(() => {
        view = null;
        map?.dispose();
        map = null;
    });
</script>

<div bind:this={target} class="h-full"></div>
