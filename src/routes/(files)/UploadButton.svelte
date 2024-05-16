<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { ApiError } from '$lib/http/error';
    import { CloudArrowUp } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { chunked } from 'itertools';
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
            const readings = await Promise.all(Array.from(files, file => Cache.readFile(file)));
            for (const chunk of chunked(readings, 10))
                try {
                    const score = await Http.uploadReadings(jwt, chunk);
                    const results = await Promise.allSettled(
                        chunk.map(({ now }) => {
                            const base = now.valueOf().toString();
                            return Cache.remove(`${base}.json`);
                        }),
                    );
                    await invalidateAll();
                    for (const result of results)
                        switch (result.status) {
                            case 'rejected':
                                toast.trigger({
                                    message:
                                        result.reason instanceof Error
                                            ? `[${result.reason.name}]: ${result.reason.message}`
                                            : result.reason.toString(),
                                    background: 'variant-filled-error',
                                    autohide: false,
                                });
                                console.error(result.reason);
                            // fallsthrough
                            case 'fulfilled':
                            // fallsthrough
                            default:
                                break;
                        }
                    toast.trigger({
                        message: `You earned ${Math.floor(score)} points by uploading ${chunk.length} readings!`,
                        background: 'variant-filled-success',
                    });
                } catch (err) {
                    if (err instanceof ApiError) {
                        toast.trigger({
                            message: `[${err.name}]: ${err.message}`,
                            background: 'variant-filled-error',
                            autohide: false,
                        });
                        console.error(err);
                        continue;
                    }
                    throw err;
                }
        } catch (err) {
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

<button type="button" {disabled} class="variant-filled-secondary btn" on:click={sync}>
    <Icon src={CloudArrowUp} theme="outline" class="h-6 w-min" />
    <span>Upload</span>
</button>
