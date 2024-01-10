<script lang="ts">
    import 'ol/ol.css';
    import { Collection, Feature, Map, View } from 'ol';
    import { Fill, Stroke, Style } from 'ol/style';
    import { Geolocation, type Position } from '@capacitor/geolocation';
    import { OSM as OpenStreetMap, Vector as VectorSource } from 'ol/source';
    import { Vector as VectorLayer, WebGLTile as WebGLTileLayer } from 'ol/layer';
    import { AccessPointControl } from './Control';
    import { Circle } from 'ol/geom';
    import { fromLonLat } from 'ol/proj';
    import { modeCurrent } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';

    /** Non-reactive prop only used for initializing view center. */
    // eslint-disable-next-line init-declarations
    export let coords: Position['coords'];
    $: ({ longitude, latitude, accuracy } = coords);

    const osmLayer = new WebGLTileLayer({ preload: Infinity });
    $: tileUrl = $modeCurrent
        ? 'https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
        : 'https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{scale}.png';
    $: osmLayer.setSource(new OpenStreetMap({ url: tileUrl }));

    // eslint-disable-next-line init-declarations
    let target: HTMLDivElement | undefined;
    onMount(() => {
        const center = fromLonLat([longitude, latitude]);
        const view = new View({ center, zoom: 15, enableRotation: false });
        const hexFeatures = new Collection<Feature>();

        const gps = new Circle(center, accuracy);
        const gpsFeature = new Feature(gps);
        gpsFeature.setStyle(
            new Style({
                fill: new Fill({ color: '#4f46e566' }),
                stroke: new Stroke({ color: '#0ea5e988', width: 4 }),
            }),
        );

        const map = new Map({
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

        const watcher = Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
            if (pos === null) return;
            const { longitude, latitude, accuracy } = pos.coords;
            gps.setCenterAndRadius(fromLonLat([longitude, latitude]), accuracy);
        });

        return async () => {
            map.dispose();
            const id = await watcher;
            await Geolocation.clearWatch({ id });
        };
    });
</script>

<div bind:this={target} class="h-full"></div>
