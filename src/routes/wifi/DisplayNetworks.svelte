<script lang="ts">
    import type { Network } from '$lib/models/wifi';
    import type { Output } from 'valibot';

    // eslint-disable-next-line init-declarations
    export let networks: Output<typeof Network>[];
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>BSSID</th>
                <th>SSID</th>
                <th>RSSI</th>
                <th>Channel Width</th>
                <th>Frequency (MHz)</th>
                <th>Center Frequency 1 (MHz)</th>
                <th>Center Frequency 2 (MHz)</th>
                <th>Capabilities</th>
            </tr>
        </thead>
        <tbody>
            {#each networks as { timestamp, BSSID, SSID, level, channelWidth, frequency, centerFreq0, centerFreq1, capabilities } (BSSID)}
                <tr>
                    <td>{timestamp}</td>
                    <td>{BSSID}</td>
                    <td>{SSID}</td>
                    <td>{level}</td>
                    <td>{channelWidth}</td>
                    <td>{frequency}</td>
                    <td>{centerFreq0}</td>
                    <td>{centerFreq1}</td>
                    <td>{capabilities}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
