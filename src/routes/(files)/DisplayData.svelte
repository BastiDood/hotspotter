<script lang="ts">
    import type { Data } from '$lib/models/api';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Ratings } from '@skeletonlabs/skeleton';
    import { Star } from '@steeze-ui/heroicons';
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
                    <td
                        ><a href="/readings/{name}/" class="anchor"
                            ><time datetime={now.toISOString()}>{now.toLocaleString()}</time></a
                        ></td
                    >
                    <td>{longitude}</td>
                    <td>{latitude}</td>
                    <td><time datetime={gpsTimestamp.toISOString()}>{gpsTimestamp.toLocaleString()}</time></td>
                    <td>{wifi.length}</td>
                    <td><time datetime={simTimestamp.toISOString()}>{simTimestamp.toLocaleString()}</time></td>
                    <td>
                        <Ratings spacing="" value={level} max={4}>
                            <Icon src={Star} class="h-4" slot="empty" />
                            <Icon src={Star} class="h-4" slot="full" theme="solid" />
                        </Ratings>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
