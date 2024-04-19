<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let name: string;
    // eslint-disable-next-line init-declarations
    export let value: 7 | 14 | 28 | null;
</script>

<select {name} bind:value class="select pointer-events-auto">
    <option value={7}>One Week (7 Days)</option>
    <option value={14}>Two Week (14 Days)</option>
    <option value={28}>One Month (28 Days)</option>
    <option value={null}>All Time</option>
</select>
