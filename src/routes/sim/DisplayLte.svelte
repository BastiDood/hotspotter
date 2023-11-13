<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let rssi: number;
    // eslint-disable-next-line init-declarations
    export let timingAdvance: number;
    // eslint-disable-next-line init-declarations
    export let cqi: number;
    // eslint-disable-next-line init-declarations
    export let cqiTableIndex: number | null;
    // eslint-disable-next-line init-declarations
    export let rsrp: number;
    // eslint-disable-next-line init-declarations
    export let rsrq: number;
    // eslint-disable-next-line init-declarations
    export let rssnr: number;
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
                <td>{timingAdvance}</td>
                <td>{cqi}</td>
                <td>{cqiTableIndex}</td>
                <td>{rsrp}</td>
                <td>{rsrq}</td>
                <td>{rssnr}</td>
            </tr>
        </tbody>
    </table>
</div>
