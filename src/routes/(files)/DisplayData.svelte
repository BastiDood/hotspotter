<script lang="ts">
    import type { Data } from '$lib/models/api';
    import { Ratings } from '@skeletonlabs/skeleton';
    // eslint-disable-next-line init-declarations
    export let files: Data[];
</script>

<div class="table-container">
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
            {#each files as { now, gps: { timestamp: gpsTimestamp, longitude, latitude }, wifi, sim: { strength: { timestamp: simTimestamp, level } } }}
                {@const name = now.valueOf().toString()}
                <tr>
                    <td><a href="/readings/{name}/" class="anchor">{name}</a></td>
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
</div>
