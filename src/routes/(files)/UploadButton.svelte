<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { ApiError, ProviderTimeoutError } from '$lib/http/error';
    import { CloudArrowUp } from '@steeze-ui/heroicons';
    import type { Data } from '$lib/models/api';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { chunked } from 'itertools';
    import cookie from 'cookie';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { invalidateAll } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();

    async function clear(readings: Data[]) {
        await Promise.all(
            readings.map(({ now }) => {
                const base = now.valueOf().toString();
                return Cache.remove(`${base}.json`);
            }),
        );
    }

    async function tryUpload(jwt: string, readings: Data[]) {
        try {
            const score = await Http.uploadReadings(jwt, readings);
            await clear(readings);
            return score;
        } catch (err) {
            if (err instanceof ApiError) {
                console.error(err);
                if (err instanceof ProviderTimeoutError)
                    toast.trigger({
                        message: `[${err.name}]: The server timed out. Please try again later. ${err.message}`,
                        background: 'variant-filled-warning',
                        autohide: false,
                    });
                else {
                    toast.trigger({
                        message: `[${err.name}]: Invalid data dumped to the server for manual review. ${err.message}`,
                        background: 'variant-filled-warning',
                        autohide: false,
                    });
                    await clear(readings);
                }
                return null;
            }
            throw err;
        }
    }

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
            for (const chunk of chunked(readings, 10)) {
                const score = await tryUpload(jwt, readings);
                await invalidateAll();
                if (score === null) continue;
                toast.trigger({
                    message: `You earned ${Math.floor(score)} points by uploading ${chunk.length} readings!`,
                    background: 'variant-filled-success',
                });
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
