<script lang="ts">
    import Error from '$lib/alerts/Error.svelte';
    import { Geolocation } from '@capacitor/geolocation';
    import Map from './Map.svelte';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
</script>

{#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
    <div class="flex h-full items-center justify-center">
        <ProgressRadial />
    </div>
{:then { coords }}
    <Map {coords} />
{:catch err}
    <!-- eslint-disable-next-line no-undef -->
    {#if err instanceof GeolocationPositionError}
        {@const { code, message } = err}
        <Error>[{code}]: {message}</Error>
    {:else}
        <Error>{err}</Error>
    {/if}
{/await}
