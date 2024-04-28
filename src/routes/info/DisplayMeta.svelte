<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let date: Date;
    // eslint-disable-next-line init-declarations
    export let revision: string;
    $: datetime = date.toISOString();
    $: text = date.toLocaleString();
</script>

<div class="card flex flex-col p-4">
    <span class="font-bold">Build Date</span>
    <span class="text-surface-600-300-token text-sm"><time {datetime}>{text}</time></span>
</div>
<div class="card flex flex-col p-4">
    <span class="font-bold">Revision</span>
    <span class="text-surface-400-500-token text-sm"><code class="code">{revision}</code></span>
</div>
