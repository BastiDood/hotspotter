<script lang="ts">
    import { slide } from 'svelte/transition';
    // eslint-disable-next-line init-declarations
    export let name: string;
    // eslint-disable-next-line init-declarations
    export let value: number | null;
</script>

<select {name} bind:value class="select variant-form-material pointer-events-auto" transition:slide={{ duration: 300 }}>
    <option value={51502}>Globe Telecom</option>
    <option value={51503}>Smart Communications</option>
    <option value={51505}>Sun Cellular</option>
    <option value={51524}>ABS-CBN Mobile</option>
    <option value={51566}>DITO Telecommunity</option>
    <option value={515}>All Philippine Operators</option>
    <option value={null}>All Operators</option>
</select>
