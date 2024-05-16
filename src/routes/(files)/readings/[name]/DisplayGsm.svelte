<script lang="ts">
    // eslint-disable-next-line init-declarations, no-undefined
    export let rssi = undefined as number | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let bit_error_rate = undefined as number | null | undefined;
    // eslint-disable-next-line init-declarations, no-undefined
    export let timing_advance = null as number | null;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Received Signal Strength Indicator (dBm)</th>
                <th>Bit Error Rate</th>
                <th>Timing Advance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{rssi}</td>
                <td>{bit_error_rate}</td>
                <td>{timing_advance}</td>
            </tr>
        </tbody>
    </table>
</div>
