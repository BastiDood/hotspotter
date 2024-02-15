<script lang="ts">
    import 'ol/ol.css';
    import { Collection, Feature, Map } from 'ol';
    import { Fill, Stroke, Style } from 'ol/style';
    import { Geolocation, type Position } from '@capacitor/geolocation';
    import { OSM as OpenStreetMap, Vector as VectorSource } from 'ol/source';
    import { Vector as VectorLayer, WebGLTile as WebGLTileLayer } from 'ol/layer';
    import { Circle } from 'ol/geom';
    import { DashboardControl } from './Dashboard';
    import { fromLonLat } from 'ol/proj';
    import { modeCurrent } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';

    const osmLayer = new WebGLTileLayer({ preload: Infinity });
    $: tileUrl = $modeCurrent
        ? 'https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
        : 'https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{scale}.png';
    $: osmLayer.setSource(new OpenStreetMap({ url: tileUrl }));

    /** Non-reactive prop only used for initializing view center. */
    // eslint-disable-next-line init-declarations
    export let coords: Position['coords'];

    const { longitude, latitude, accuracy } = coords;
    const center = fromLonLat([longitude, latitude]);

    // eslint-disable-next-line init-declarations
    export let base: URL;
    const dashboard = new DashboardControl(base, center);
    const gpsVisibleStore = dashboard.gps;
    const hexVisibleStore = dashboard.hex;

    const gps = new Circle(center, accuracy);
    const gpsFeature = new Feature(gps);
    gpsFeature.setStyle(
        new Style({
            fill: new Fill({ color: '#4f46e566' }),
            stroke: new Stroke({ color: '#0ea5e988', width: 2 }),
        }),
    );

    const gpsLayer = new VectorLayer({ source: new VectorSource({ features: new Collection([gpsFeature]) }) });
    $: gpsLayer.setVisible($gpsVisibleStore);

    const hexFeatures = new Collection<Feature>();
    const hexLayer = new VectorLayer({
        source: new VectorSource({ features: hexFeatures }),
        style(feature) {
            const color = feature.get('color');
            if (typeof color !== 'string') return;
            return [
                new Style({
                    fill: new Fill({ color }),
                    stroke: new Stroke({ color: [79, 70, 229, 0.5], width: 2 }),
                }),
            ];
        },
    });
    $: hexLayer.setVisible($hexVisibleStore);

    let controller = null as AbortController | null;
    function refreshHexagons() {
        controller?.abort();
        controller = new AbortController();
        // NOTE: We use `then` so that the outer function returns `void`.
        dashboard
            .refreshAccessPoints(controller.signal)
            .then(features => {
                hexFeatures.clear();
                hexFeatures.extend(features);
                controller = null;
            })
            .catch(err => {
                // Only reset the controller if the error is unexpected.
                if (err instanceof DOMException && err.name === 'AbortError') return;
                controller = null;
                throw err;
            });
    }

    // eslint-disable-next-line init-declarations
    let target: HTMLDivElement | undefined;
    onMount(() => {
        const map = new Map({
            target,
            view: dashboard.view,
            controls: new Collection([dashboard]),
            layers: [osmLayer, hexLayer, gpsLayer],
        });
        const watcher = Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
            if (pos === null) return;
            const { longitude, latitude, accuracy } = pos.coords;
            gps.setCenterAndRadius(fromLonLat([longitude, latitude]), accuracy);
        });
        map.addEventListener('loadend', refreshHexagons);
        return async () => {
            map.removeEventListener('loadend', refreshHexagons);
            map.dispose();
            const id = await watcher;
            await Geolocation.clearWatch({ id });
        };
    });
</script>

<div bind:this={target} class="h-full"></div>
