<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let dbm: number;
    // eslint-disable-next-line init-declarations
    export let ecio: number;
    // eslint-disable-next-line init-declarations
    export let level: number;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Strength Level</th>
                <th>Signal Strength (dBm)</th>
                <th>Energy per Chip over the Noise Spectral Density (dB)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{level}</td>
                <td>{dbm}</td>
                <td>{ecio}</td>
            </tr>
        </tbody>
    </table>
</div>
