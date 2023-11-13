<script lang="ts">
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { onNavigate } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ position } = data);
    $: lat = position?.coords.latitude ?? 0;
    $: long = position?.coords.longitude ?? 0;

    // eslint-disable-next-line init-declarations
    let id: string | undefined;

    onMount(async () => {
        id = await Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
            if (pos === null) return;
            position = pos;
        });
    });

    onNavigate(async () => {
        if (typeof id === 'undefined') return;
        await Geolocation.clearWatch({ id });
    });
</script>

<Map zoom={15} latitude={lat} longitude={long} />
