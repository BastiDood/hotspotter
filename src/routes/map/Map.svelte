<script lang="ts">
    import 'ol/ol.css';
    import { Collection, Feature, Map, View } from 'ol';
    import { Fill, Stroke, Style } from 'ol/style';
    import { OSM as OpenStreetMap, Vector as VectorSource } from 'ol/source';
    import { Vector as VectorLayer, WebGLTile as WebGLTileLayer } from 'ol/layer';
    import { onDestroy, onMount } from 'svelte';
    import { AccessPointControl } from './Control';
    import type { Circle } from 'ol/geom';
    import type { Coordinate } from 'ol/coordinate';
    import { modeCurrent } from '@skeletonlabs/skeleton';

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

    const osmLayer = new WebGLTileLayer({ preload: Infinity });
    $: tileUrl = $modeCurrent
        ? 'https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
        : 'https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{scale}.png';
    $: osmLayer.setSource(new OpenStreetMap({ url: tileUrl }));

    let map = null as Map | null;
    export function setViewCenter(coords: Coordinate) {
        map?.getView().setCenter(coords);
    }

    // eslint-disable-next-line init-declarations
    let target: HTMLDivElement | undefined;
    onMount(() => {
        const view = new View({ zoom: 15, enableRotation: false });
        const hexFeatures = new Collection<Feature>();
        map = new Map({
            target,
            view,
            layers: [
                osmLayer,
                new VectorLayer({
                    source: new VectorSource({ features: hexFeatures }),
                    style(feature) {
                        const density = feature.get('density');
                        if (typeof density === 'number')
                            return [
                                new Style({
                                    fill: new Fill({ color: [79, 70, 229, density] }),
                                    stroke: new Stroke({ color: [79, 70, 229], width: 2 }),
                                }),
                            ];
                    },
                }),
                new VectorLayer({ source: new VectorSource({ features: new Collection([gpsFeature]) }) }),
            ],
        });
        map.getControls().extend([new AccessPointControl(view, hexFeatures)]);
    });

    onDestroy(() => {
        map?.dispose();
        map = null;
    });
</script>

<div bind:this={target} class="h-full"></div>
