<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Http from '$lib/http';
    import { ApiError, ProviderTimeoutError } from '$lib/http/error';
    import { type Data, DumpBatch } from '$lib/models/api';
    import { CloudArrowUp } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { assert } from '$lib/assert';
    import { chunked } from 'itertools';
    import cookie from 'cookie';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { invalidateAll } from '$app/navigation';
    import { safeParse } from 'valibot';

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
                        message: `[${err.name}]: The server timed out. Please try again later or set a smaller batch size. ${err.message}`,
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

    async function sync(form: HTMLFormElement) {
        const jwt = cookie.parse(document.cookie)['id'];
        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'User is not logged in.',
                background: 'variant-filled-error',
            });
            return;
        }

        const data = new FormData(form);
        const batch = data.get('batch');
        if (batch instanceof File) {
            toast.trigger({
                message: 'Batch number cannot be a file.',
                background: 'variant-filled-error',
            });
            return;
        }

        const batchSize = batch ? parseInt(batch, 10) : 20;
        if (!isFinite(batchSize)) {
            toast.trigger({
                message: 'Batch number must be finite.',
                background: 'variant-filled-error',
            });
            return;
        }

        disabled = true;
        try {
            const files = await Cache.read();
            const results = await Promise.allSettled(Array.from(files, file => Cache.readFile(file)));

            const readings = [] as Data[];
            const dumps = [] as DumpBatch;
            const paths = [] as string[];
            for (const result of results)
                switch (result.status) {
                    case 'fulfilled':
                        readings.push(result.value);
                        break;
                    case 'rejected':
                        console.error(result.reason);
                        if (result.reason instanceof Cache.ReadError) {
                            const valiResult = safeParse(DumpBatch.item, result.reason.value);
                            if (valiResult.success) {
                                dumps.push(valiResult.output);
                                paths.push(result.reason.path);
                            } else
                                toast.trigger({
                                    message: `[${result.reason.name}]: ${result.reason.path} is corrupted. ${result.reason.message}`,
                                    background: 'variant-filled-error',
                                    autohide: false,
                                });
                            break;
                        }
                        if (result.reason instanceof Error) {
                            toast.trigger({
                                message: `[${result.reason.name}]: ${result.reason.message}`,
                                background: 'variant-filled-error',
                                autohide: false,
                            });
                            break;
                        }
                        toast.trigger({
                            message: `${result.reason}`,
                            background: 'variant-filled-error',
                        });
                        break;
                    default:
                        break;
                }

            assert(dumps.length === paths.length, 'dumps and paths must be in lockstep');
            if (dumps.length > 0) {
                await Http.dumpReadings(jwt, dumps);
                await Promise.all(paths.map(p => Cache.remove(p)));
                await invalidateAll();
                toast.trigger({
                    message: `Quarantined ${dumps.length} partially corrupted readings for manual review.`,
                    background: 'variant-filled-warning',
                    autohide: false,
                });
            }

            for (const chunk of chunked(readings, batchSize)) {
                const score = await tryUpload(jwt, chunk);
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

<form on:submit|preventDefault|stopPropagation={({ currentTarget }) => sync(currentTarget)}>
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] items-center">
        <div class="input-group-shim h-full"><Icon src={CloudArrowUp} theme="mini" class="size-6" /></div>
        <input type="number" name="batch" min="1" max="20" placeholder="Batch Size (Default: 20)" class="px-3 py-2" />
        <button type="submit" {disabled} class="variant-filled-secondary h-full">Upload</button>
    </div>
</form>
