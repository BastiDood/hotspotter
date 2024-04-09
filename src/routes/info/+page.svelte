<script>
    import DisplayMeta from './DisplayMeta.svelte';
    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ timestamp, revision } = data);
    $: date = new Date(timestamp);
</script>

<div class="p-4">
    <DisplayMeta {date} {revision} />
</div>
