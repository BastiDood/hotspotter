<script lang="ts">
    import { ArrowRightStartOnRectangle } from '@steeze-ui/heroicons';
    import { CapacitorCookies } from '@capacitor/core';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';

    const dispatch = createEventDispatcher<{ out: null }>();
    const toast = getToastStore();
    async function logOut(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await CapacitorCookies.deleteCookie({ key: 'id' });
            toast.trigger({
                message: 'Successfully logged out.',
                background: 'variant-filled-success',
            });
            dispatch('out');
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

<button
    type="button"
    class="variant-filled-tertiary btn-icon btn-icon-sm p-1"
    on:click={({ currentTarget }) => logOut(currentTarget)}
>
    <Icon src={ArrowRightStartOnRectangle} theme="micro" />
</button>
