<script lang="ts">
    import 'ol/ol.css';
    import { onDestroy, onMount } from 'svelte';
    import { Circle } from 'ol/geom';
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

    let target = null as HTMLDivElement | null;
    let view = null as View | null;
    let map = null as Map | null;

    // eslint-disable-next-line init-declarations
    export let zoom: number;
    $: view?.setZoom(zoom);

    // eslint-disable-next-line init-declarations
    export let center: Coordinate;
    export let radius = 0;

    const user = new Circle(center, radius);
    $: user.setCenter(center);
    $: user.setRadius(radius);

    const feature = new Feature({ geometry: user });
    feature.setStyle(
        new Style({
            fill: new Fill({ color: '#4f46e566' }),
            stroke: new Stroke({ color: '#0ea5e988', width: 4 }),
        }),
    );

    export const features = new Collection<Feature>();

    onMount(() => {
        assert(target !== null);
        view = new View({ center, zoom, enableRotation: false });
        map = new Map({
            target,
            view,
            layers: [
                new TileLayer({ source: new OpenStreetMap() }),
                new VectorLayer({ source: new VectorSource({ features }) }),
                new VectorLayer({ source: new VectorSource({ features: new Collection([feature]) }) }),
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
