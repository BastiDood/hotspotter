<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import Path from 'path-browserify';
    import { Ratings } from '@skeletonlabs/skeleton';
    import Success from '$lib/alerts/Success.svelte';
    import SyncButton from './SyncButton.svelte';
    import UploadButton from './UploadButton.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ files } = data);

    let disabled = false;
</script>

<div class="prose max-w-none space-y-4 p-4 dark:prose-invert">
    <div class="flex justify-center">
        <UploadButton bind:disabled />
    </div>
    <hr />
    <h3 class="h3">Cached Readings</h3>
    {#if files.length === 0}
        <Success>All readings synchronized. &#x1F389;</Success>
    {:else}
        <SyncButton bind:disabled />
        <ClearButton bind:disabled />
        <section class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Longitude</th>
                        <th>Latitude</th>
                        <th>Location Timestamp</th>
                        <th>Wi-Fi Access Points</th>
                        <th>Cellular Timestamp</th>
                        <th>Cellular Signal</th>
                    </tr>
                </thead>
                <tbody>
                    {#each files as { path, payload: { gps: { timestamp: gpsTimestamp, longitude, latitude }, wifi, sim: { strength: { timestamp: simTimestamp, level } } } }}
                        {@const { base, name } = Path.parse(path)}
                        <tr>
                            <td><a href="/readings/{base}">{name}</a></td>
                            <td>{longitude}</td>
                            <td>{latitude}</td>
                            <td>{gpsTimestamp.toLocaleString()}</td>
                            <td>{wifi.length}</td>
                            <td>{simTimestamp.toLocaleString()}</td>
                            <td><Ratings max={4} value={level} /></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}
</div>
