<script lang="ts">
    import * as Api from '$lib/http';
    import * as Cache from '$lib/plugins/Cache';
    import * as Config from '$lib/plugins/Config';
    import * as TelephonyInfo from '$lib/plugins/TelephonyInfo';
    import * as WifiInfo from '$lib/plugins/WifiInfo';
    import { ArrowPathIcon, ArrowUpTrayIcon } from '@krowten/svelte-heroicons';
    import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
    import type { Data } from '$lib/models/api';
    import type { Output } from 'valibot';

    const enum State {
        NONE,
        LOADING,
        SUCCESS,
        FAILURE,
    }

    function stateToProgress(state: State) {
        switch (state) {
            case State.NONE:
                return 0;
            case State.LOADING:
                return 50;
            case State.SUCCESS:
                return 100;
            case State.FAILURE:
                return 0;
            default:
                throw new Error('unexpected state type');
        }
    }

    const toast = getToastStore();

    let wifiLoadState = State.NONE;
    async function scan() {
        wifiLoadState = State.LOADING;
        try {
            const wifi = await WifiInfo.performOneshotScan();
            wifiLoadState = State.SUCCESS;
            return wifi;
        } catch (err) {
            wifiLoadState = State.FAILURE;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    let simLoadState = State.NONE;
    async function getSim() {
        simLoadState = State.LOADING;
        try {
            const sim = await TelephonyInfo.getSim();
            simLoadState = State.SUCCESS;
            return sim;
        } catch (err) {
            simLoadState = State.FAILURE;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    let signalLoadState = State.NONE;
    async function getSignalStrength() {
        signalLoadState = State.LOADING;
        try {
            const signal = await TelephonyInfo.getSignalStrength();
            signalLoadState = State.SUCCESS;
            return signal;
        } catch (err) {
            signalLoadState = State.FAILURE;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    async function upload(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const url = await Config.getUrl();
            if (url === null) {
                toast.trigger({
                    message: 'No API endpoint has been set yet.',
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return;
            }

            const [wifi, sim, strength] = await Promise.all([scan(), getSim(), getSignalStrength()]);
            const body = { wifi, sim, strength };
            try {
                await Api.submit(url, body);
            } catch (err) {
                const uri = await Cache.write(body);
                toast.trigger({
                    message: `Cached the current readings at ${uri}.`,
                    background: 'variant-filled-warning',
                    autohide: false,
                });
                throw err;
            }

            toast.trigger({
                message: 'Successfully uploaded the data.',
                background: 'variant-filled-success',
                autohide: false,
            });
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

    async function submitFile(url: URL, path: string, data: Output<typeof Data>) {
        // The ordering of the operations is important here. We emphasize that
        // the cache is only removed after a successful data submission. If the
        // write operation fails (somehow), we are fine with the duplicated data.
        // This is better than the alternative where we delete the reading before
        // a successful transmission, in which case there is the possibility for
        // the data to be deleted yet the transmission fails.
        await Api.submit(url, data);
        await Cache.remove(path);
    }

    async function sync(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const url = await Config.getUrl();
            if (url === null) {
                toast.trigger({
                    message: 'No API endpoint has been set yet.',
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return;
            }

            const files = await Cache.read();
            const promises = files.map(({ path, payload }) => submitFile(url, path, payload));
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

<div class="space-y-4">
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => upload(currentTarget)}>
        <ArrowUpTrayIcon class="h-4" />
        <span>Upload</span>
    </button>
    <button type="button" class="variant-filled-secondary btn" on:click={({ currentTarget }) => sync(currentTarget)}>
        <ArrowPathIcon class="h-4" />
        <span>Sync</span>
    </button>
    <ul class="list">
        <li>
            <ProgressRadial width="w-8" value={stateToProgress(wifiLoadState)} />
            <span>WiFi</span>
        </li>
        <li>
            <ProgressRadial width="w-8" value={stateToProgress(simLoadState)} />
            <span>SIM</span>
        </li>
        <li>
            <ProgressRadial width="w-8" value={stateToProgress(signalLoadState)} />
            <span>Signal Strength</span>
        </li>
    </ul>
</div>
