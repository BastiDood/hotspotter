<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let date: Date;
    // eslint-disable-next-line init-declarations
    export let revision: string;
    $: datetime = date.toISOString();
    $: text = date.toLocaleString();
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Revision</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><time {datetime}>{text}</time></td>
                <td><code class="code">{revision}</code></td>
            </tr>
        </tbody>
    </table>
</div>
