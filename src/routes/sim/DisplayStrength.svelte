<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let date: Date;
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
                <td>{date.toLocaleString()}</td>
                <td>{level}</td>
            </tr>
        </tbody>
    </table>
</div>
