<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { ArrowPath } from '@steeze-ui/heroicons';
    import { BatchOperationError } from '$lib/http/error';
    import { Icon } from '@steeze-ui/svelte-icon';
    import cookie from 'cookie';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { invalidateAll } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();
    async function sync() {
        const jwt = cookie.parse(document.cookie)['id'];
        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'User is not logged in.',
                background: 'variant-filled-error',
                autohide: false,
            });
            return;
        }
        disabled = true;
        try {
            const files = await Cache.read();
            const score = await Http.uploadReadings(jwt, files);
            const promises = files.map(({ now }) => {
                const base = now.valueOf().toString();
                return Cache.remove(`${base}.json`);
            });
            await Promise.all(promises);
            toast.trigger({
                message: `You earned ${Math.floor(score)} points by uploading ${files.length} readings!`,
                background: 'variant-filled-success',
                autohide: false,
            });
        } catch (err) {
            if (err instanceof Error) {
                if (err instanceof BatchOperationError)
                    toast.trigger({
                        message: 'Failed to upload the readings in batch. The data is likely corrupted.',
                        background: 'variant-filled-error',
                        autohide: false,
                    });
                else
                    toast.trigger({
                        message: `[${err.name}]: ${err.message}`,
                        background: 'variant-filled-error',
                        autohide: false,
                    });
                return;
            }
            throw err;
        } finally {
            await invalidateAll();
            disabled = false;
        }
    }
</script>

<button {disabled} class="variant-filled-secondary btn" on:click={sync}>
    <Icon src={ArrowPath} theme="outline" class="h-4" />
    <span>Sync</span>
</button>
