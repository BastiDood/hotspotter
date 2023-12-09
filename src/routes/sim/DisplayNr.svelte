<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let csiCqiReport: number[] | undefined;
    // eslint-disable-next-line init-declarations
    export let csiCqiTableIndex: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let csiRsrp: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let csiRsrq: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let csiSinr: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let ssRsrp: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let ssRsrq: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let ssSinr: number | null | undefined;
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
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{csiCqiReport}</td>
                <td>{csiCqiTableIndex}</td>
                <td>{csiRsrp}</td>
                <td>{csiRsrq}</td>
                <td>{csiSinr}</td>
                <td>{ssRsrp}</td>
                <td>{ssRsrq}</td>
                <td>{ssSinr}</td>
            </tr>
        </tbody>
    </table>
</div>
