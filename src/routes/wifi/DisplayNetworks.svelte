<script lang="ts">
    import type { AccessPoint } from '$lib/models/wifi';
    import type { Output } from 'valibot';
    import { Ratings } from '@skeletonlabs/skeleton';
    import { StarIcon } from '@krowten/svelte-heroicons';

    // eslint-disable-next-line init-declarations
    export let networks: Output<typeof AccessPoint>[];
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Standard</th>
                <th>Rating</th>
                <th>BSSID</th>
                <th>SSID</th>
                <th>RSSI</th>
                <th>Channel Width</th>
                <th>Frequency (MHz)</th>
                <th>Center Frequency 1 (MHz)</th>
                <th>Center Frequency 2 (MHz)</th>
            </tr>
        </thead>
        <tbody>
            {#each networks as { timestamp, bssid, ssid, standard, rssi, level, maxLevel, channelWidth, frequency, centerFreq0, centerFreq1 } (bssid)}
                <tr>
                    <td>{timestamp.toLocaleString()}</td>
                    <td>{standard}</td>
                    <td>
                        <Ratings spacing="" max={maxLevel} value={level}>
                            <StarIcon class="h-4" slot="empty" />
                            <StarIcon class="h-4" slot="full" solid />
                        </Ratings>
                    </td>
                    <td>{bssid}</td>
                    <td>{ssid}</td>
                    <td>{rssi}</td>
                    <td>{channelWidth}</td>
                    <td>{frequency}</td>
                    <td>{centerFreq0}</td>
                    <td>{centerFreq1}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
