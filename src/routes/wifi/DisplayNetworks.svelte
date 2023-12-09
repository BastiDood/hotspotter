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
            {#each networks as { wifi_timestamp, bssid, ssid, standard, rssi, level, max_level, channel_width, frequency, center_freq_0, center_freq_1 } (bssid)}
                <tr>
                    <td>{wifi_timestamp.toLocaleString()}</td>
                    <td>{standard}</td>
                    <td>
                        <Ratings spacing="" max={max_level} value={level}>
                            <StarIcon class="h-4" slot="empty" />
                            <StarIcon class="h-4" slot="full" solid />
                        </Ratings>
                    </td>
                    <td>{bssid}</td>
                    <td>{ssid}</td>
                    <td>{rssi}</td>
                    <td>{channel_width}</td>
                    <td>{frequency}</td>
                    <td>{center_freq_0}</td>
                    <td>{center_freq_1}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
