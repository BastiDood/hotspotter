<script lang="ts">
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Signal } from '@steeze-ui/heroicons';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { startScan } from '$lib/plugins/WifiInfo';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();
    async function request() {
        disabled = true;
        try {
            if (await startScan()) return;
            toast.trigger({
                message:
                    'Wi-Fi scanning failed. This may be due to permission errors, throttling, or disabled Wi-Fi radios.',
                background: 'variant-filled-error',
            });
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                toast.trigger({
                    message: `[${err.name}]: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return;
            }
            throw err;
        } finally {
            disabled = false;
        }
    }
</script>

<button type="button" {disabled} class="variant-filled-primary btn" on:click={request}>
    <Icon src={Signal} theme="outline" class="h-6 w-min" />
    <span>Scan</span>
</button>
