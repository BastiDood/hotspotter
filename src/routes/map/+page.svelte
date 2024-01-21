<script lang="ts">
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';
    import { ProgressRadial } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ base } = data);
</script>

{#if base === null}
    <Error>There is no <a href="/settings/" class="anchor">base endpoint</a> set yet.</Error>
{:else}
    {#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
        <div class="flex h-full items-center justify-center">
            <ProgressRadial />
        </div>
    {:then { coords }}
        <Map {base} {coords} />
    {:catch err}
        <!-- eslint-disable-next-line no-undef -->
        {#if err instanceof GeolocationPositionError}
            {@const { code, message } = err}
            <Error>[{code}]: {message}</Error>
        {:else}
            <Error>{err}</Error>
        {/if}
    {/await}
{/if}
