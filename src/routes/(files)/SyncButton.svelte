<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { chunked, imap } from 'itertools';
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
            const scores = await Promise.allSettled(
                imap(chunked(files, 10), async chunk => {
                    const score = await Http.uploadReadings(jwt, chunk);
                    const results = await Promise.allSettled(
                        chunk.map(({ now }) => {
                            const base = now.valueOf().toString();
                            return Cache.remove(`${base}.json`);
                        }),
                    );
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
                    return score;
                }),
            );
            const score = scores.reduce((score, curr) => {
                switch (curr.status) {
                    case 'fulfilled':
                        return score + curr.value;
                    case 'rejected':
                        toast.trigger({
                            message:
                                curr.reason instanceof Error
                                    ? `[${curr.reason.name}]: ${curr.reason.message}`
                                    : curr.reason.toString(),
                            background: 'variant-filled-error',
                            autohide: false,
                        });
                        console.error(curr.reason);
                    // fallsthrough
                    default:
                        return score;
                }
            }, 0);
            toast.trigger({
                message: `You earned ${Math.floor(score)} points by uploading ${scores.length} readings!`,
                background: 'variant-filled-success',
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
