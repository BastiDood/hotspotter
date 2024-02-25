<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import { ArrowPath } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { invalidateAll } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();
    async function clear() {
        disabled = true;
        try {
            await Cache.clear();
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        } finally {
            disabled = false;
        }
        toast.trigger({
            message: 'Cache cleared.',
            background: 'variant-filled-success',
        });
        await invalidateAll();
    }
</script>

<button {disabled} class="variant-filled-secondary btn" on:click={clear}>
    <Icon src={ArrowPath} theme="outline" class="h-4" />
    <span>Sync</span>
</button>
