<script>
    import { AdjustmentsHorizontal } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { getDrawerStore } from '@skeletonlabs/skeleton';
    const drawer = getDrawerStore();
</script>

<button class="variant-filled-secondary btn-icon pointer-events-auto p-2" on:click={() => drawer.open()}
    ><Icon src={AdjustmentsHorizontal} theme="mini" /></button
>
