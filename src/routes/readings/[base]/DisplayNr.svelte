<script lang="ts">
    // eslint-disable-next-line init-declarations, no-undefined
    export let csi_cqi_report = undefined as number[] | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let csi_cqi_table_index = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let csi_rsrp = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let csi_rsrq = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let csi_sinr = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let ss_rsrp = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let ss_rsrq = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let ss_sinr = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let timing_advance_micros = undefined as number | null | undefined;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Channel State Infomration and Channel Quality Indicator Report</th>
                <th>Channel State Infomration and Channel Quality Indicator Table Index</th>
                <th>Channel State Information Channel Quality Indicator</th>
                <th>Channel State Information Channel Quality Indicator Table Index</th>
                <th>Synchronization Signal Reference Signal Received Power (dBm)</th>
                <th>Synchronization Signal Reference Signal Received Quality</th>
                <th>Synchronization Signal Reference Signal Signal-to-Noise Ratio (dB)</th>
                <th>Timing Advance (&mu;s)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{csi_cqi_report}</td>
                <td>{csi_cqi_table_index}</td>
                <td>{csi_rsrp}</td>
                <td>{csi_rsrq}</td>
                <td>{csi_sinr}</td>
                <td>{ss_rsrp}</td>
                <td>{ss_rsrq}</td>
                <td>{ss_sinr}</td>
                <td>{timing_advance_micros}</td>
            </tr>
        </tbody>
    </table>
</div>
