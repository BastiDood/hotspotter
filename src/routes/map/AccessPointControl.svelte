<script lang="ts">
    import { type Collection, Feature, type View } from 'ol';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Polygon } from 'ol/geom';
    import { assert } from '$lib/assert';
    import { cellToBoundary } from 'h3-js';
    import { fetchHexagonAccessPoints } from '$lib/http';
    import { getUrl } from '$lib/plugins/Config';
    import { onDestroy } from 'svelte';
    import { Wifi as src } from '@steeze-ui/heroicons';
    import { transformExtent } from 'ol/proj';

    // eslint-disable-next-line init-declarations
    export let view: View;
    // eslint-disable-next-line init-declarations
    export let features: Collection<Feature>;

    let state = null as AbortController | null;
    async function handleClick(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const base = await getUrl();
            if (base === null) return;

            const [minX, minY, maxX, maxY, ...rest] = transformExtent(
                view.calculateExtent(),
                view.getProjection(),
                'EPSG:4326',
            );

            assert(rest.length === 0);
            assert(typeof minX !== 'undefined');
            assert(typeof minY !== 'undefined');
            assert(typeof maxX !== 'undefined');
            assert(typeof maxY !== 'undefined');

            state = new AbortController();
            const hexes = await fetchHexagonAccessPoints(base, minX, minY, maxX, maxY, state.signal);
            // eslint-disable-next-line require-atomic-updates
            state = null;

            const MAX_ACCESS_POINTS = 50;
            const feats = Object.entries(hexes).map(([hex, count]) => {
                const clamped = Math.min(count, MAX_ACCESS_POINTS);
                const density = (clamped / MAX_ACCESS_POINTS) * 0.6;
                const geometry = new Polygon([cellToBoundary(hex, true)]).transform('EPSG:4326', view.getProjection());
                return new Feature({ geometry, density });
            });

            features.clear();
            features.extend(feats);
        } catch (err) {
            // eslint-disable-next-line require-atomic-updates
            state = null;
            throw err;
        } finally {
            button.disabled = false;
        }
    }

    onDestroy(() => state?.abort());
</script>

<button
    class="variant-filled-primary btn-icon absolute bottom-2 left-2"
    on:click={({ currentTarget }) => handleClick(currentTarget)}
>
    <Icon {src} class="m-auto h-4" />
</button>
