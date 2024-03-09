<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let timing_advance: number | null;
    // eslint-disable-next-line init-declarations, no-undefined
    export let rssi = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let cqi = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let cqi_table_index = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let rsrp = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let rsrq = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let rssnr = undefined as number | null | undefined;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Received Signal Strength Indicator (dBm)</th>
                <th>Timing Advance</th>
                <th>Channel Quality Indicator</th>
                <th>Channel Quality Indicator Table Index</th>
                <th>Reference Signal Received Power (dBm)</th>
                <th>Reference Signal Received Quality</th>
                <th>Reference Signal Signal-to-Noise Ratio (dB)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{rssi}</td>
                <td>{timing_advance}</td>
                <td>{cqi}</td>
                <td>{cqi_table_index}</td>
                <td>{rsrp}</td>
                <td>{rsrq}</td>
                <td>{rssnr}</td>
            </tr>
        </tbody>
    </table>
</div>
