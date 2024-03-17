<script lang="ts" context="module">
    const MAX_ACCESS_POINTS = 20;
    const GRADIENT = ['#edf8b150', '#7fcdbb50', '#2c7fb850'];
    export interface Coords {
        latitude: number;
        longitude: number;
        accuracy: number;
    }
</script>

<script lang="ts">
    import 'ol/ol.css';
    import { Circle, Polygon } from 'ol/geom';
    import { Collection, Feature, Map, View, type MapBrowserEvent } from 'ol';
    import { Fill, Stroke, Style } from 'ol/style';
    import { OSM as OpenStreetMap, Vector as VectorSource } from 'ol/source';
    import { Vector as VectorLayer, WebGLTile as WebGLTileLayer } from 'ol/layer';
    import { DashboardControl } from './Dashboard';
    import { Geolocation } from '@capacitor/geolocation';
    import { PopupOverlay } from './Popup';
    import { abortable } from './Abortable';
    import { assert } from '$lib/assert';
    import { cellToBoundary } from 'h3-js';
    import { fetchHexagonAccessPoints } from '$lib/http';
    import { fromLonLat } from 'ol/proj';
    import { modeCurrent } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';
    import { validateExtent } from '$lib/util';

    const osmLayer = new WebGLTileLayer({ preload: Infinity });
    $: tileUrl = $modeCurrent
        ? 'https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
        : 'https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{scale}.png';
    $: osmLayer.setSource(new OpenStreetMap({ url: tileUrl }));

    /** Non-reactive prop only used for initializing view center. */
    // eslint-disable-next-line init-declarations
    export let coords: Coords;

    const { longitude, latitude, accuracy } = coords;
    const center = fromLonLat([longitude, latitude]);

    // eslint-disable-next-line init-declarations
    const dashboard = new DashboardControl(center);
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

    const refreshHexagons = abortable(async signal => {
        const { minX, maxX, minY, maxY, proj } = validateExtent(dashboard.view);
        const hexes = await fetchHexagonAccessPoints(minX, minY, maxX, maxY, signal);
        const features = Object.entries(hexes).map(([hex, count]) => {
            const geometry = new Polygon([cellToBoundary(hex, true)]).transform('EPSG:4326', proj);
            const density = Math.min(count, MAX_ACCESS_POINTS) / MAX_ACCESS_POINTS;
            const color = GRADIENT[Math.floor(density * (GRADIENT.length - 1))];
            assert(typeof color !== 'undefined');
            return new Feature({ geometry, hex, count, color });
        });
        hexFeatures.clear();
        hexFeatures.extend(features);
    });

    const popup = new PopupOverlay();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onMapClick({ dragging, map, coordinate }: MapBrowserEvent<any>) {
        if (!dragging) {
            const pixel = map.getPixelFromCoordinate(coordinate);
            const [feat, ..._] = map.getFeaturesAtPixel(pixel);
            if (typeof feat !== 'undefined') {
                const count = feat.get('count');
                assert(typeof count === 'number');
                popup.count = count;
                popup.setPosition(coordinate);
                return;
            }
        }
        // eslint-disable-next-line no-undefined
        popup.setPosition(undefined);
    }

    // eslint-disable-next-line init-declarations
    let target: HTMLDivElement | undefined;
    onMount(() => {
        const map = new Map({
            target,
            view: dashboard.view,
            controls: new Collection([dashboard]),
            layers: [osmLayer, gpsLayer, hexLayer],
            overlays: [popup],
        });
        const watcher = Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
            if (pos === null) return;
            const { longitude, latitude, accuracy } = pos.coords;
            gps.setCenterAndRadius(fromLonLat([longitude, latitude]), accuracy);
        });
        map.on('click', onMapClick);
        map.on('loadend', refreshHexagons);
        return async () => {
            map.un('loadend', refreshHexagons);
            map.un('click', onMapClick);
            map.dispose();
            const id = await watcher;
            await Geolocation.clearWatch({ id });
        };
    });
</script>

<div bind:this={target} class="h-full"></div>
