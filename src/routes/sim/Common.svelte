<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let dbm: number;
    // eslint-disable-next-line init-declarations
    export let asu: number;
    // eslint-disable-next-line init-declarations
    export let level: number;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Strength Level</th>
                <th>Abstract Strength Units</th>
                <th>Signal Strength (dBm)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{level}</td>
                <td>{asu}</td>
                <td>{dbm}</td>
            </tr>
        </tbody>
    </table>
</div>
