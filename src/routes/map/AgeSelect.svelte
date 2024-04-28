<script lang="ts">
    import { slide } from 'svelte/transition';
    // eslint-disable-next-line init-declarations
    export let name: string;
    // eslint-disable-next-line init-declarations
    export let value: 7 | 14 | 28 | null;
</script>

<select {name} bind:value class="select variant-form-material pointer-events-auto" transition:slide={{ duration: 300 }}>
    <option value={7}>Past Week</option>
    <option value={14}>Past Two Weeks</option>
    <option value={28}>Past Month</option>
    <option value={null}>All Time</option>
</select>
