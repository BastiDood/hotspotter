<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { ArrowPath } from '@steeze-ui/heroicons';
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
            const promises = Object.entries(files).map(async ([path, payload]) => {
                // The ordering of the operations is important here. We emphasize that
                // the cache is only removed after a successful data submission. If the
                // write operation fails (somehow), we are fine with the duplicated data.
                // This is better than the alternative where we delete the reading before
                // a successful transmission, in which case there is the possibility for
                // the data to be deleted yet the transmission fails.
                console.log(await Http.uploadReading(jwt, payload));
                await Cache.remove(path);
            });

            const results = await Promise.allSettled(promises);

            let successes = 0;
            let failures = 0;
            for (const { status } of results)
                switch (status) {
                    case 'fulfilled':
                        ++successes;
                        break;
                    case 'rejected':
                        ++failures;
                        break;
                    default:
                        throw new Error('unexpected resolution type');
                }

            if (failures > 0)
                toast.trigger({
                    message: `Some readings (${successes}) successfully synchronized. ${failures} failed.`,
                    background: 'variant-filled-warning',
                    autohide: false,
                });
            else if (successes > 0)
                toast.trigger({
                    message: `All readings (${successes}) successfully synchronized.`,
                    background: 'variant-filled-success',
                    autohide: false,
                });
            else
                toast.trigger({
                    message: 'No readings to synchronize.',
                    background: 'variant-filled-success',
                });
        } catch (err) {
            const message = err instanceof Error ? `[${err.name}]: ${err.message}` : String(err);
            toast.trigger({
                message,
                background: 'variant-filled-error',
                autohide: false,
            });
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
