<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let timestamp: Date;
    // eslint-disable-next-line init-declarations
    export let level: number;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Level</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{timestamp.toLocaleString()}</td>
                <td>{level}</td>
            </tr>
        </tbody>
    </table>
</div>
