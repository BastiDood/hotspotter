<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let rssi: number;
    // eslint-disable-next-line init-declarations
    export let bitErrorRate: number;
    // eslint-disable-next-line init-declarations
    export let timingAdvance: number;
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
                <td>{bitErrorRate}</td>
                <td>{timingAdvance}</td>
            </tr>
        </tbody>
    </table>
</div>
