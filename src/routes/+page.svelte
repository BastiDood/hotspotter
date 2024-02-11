<script lang="ts">
    import * as Api from '$lib/http';
    import * as Cache from '$lib/plugins/Cache';
    import * as Config from '$lib/plugins/Config';
    import * as TelephonyInfo from '$lib/plugins/TelephonyInfo';
    import * as WifiInfo from '$lib/plugins/WifiInfo';
    import { ArrowPath, ArrowUpTray, CloudArrowUp, Trash } from '@steeze-ui/heroicons';
    import { ProgressRadial, SlideToggle, getToastStore } from '@skeletonlabs/skeleton';
    import type { Data } from '$lib/models/api';
    import { Geolocation } from '@capacitor/geolocation';
    import { Icon } from '@steeze-ui/svelte-icon';
    import type { Output } from 'valibot';
    import { assert } from '$lib/assert';
    import cookie from 'cookie';

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

    let gpsLoadState = State.NONE;
    async function getLocation() {
        gpsLoadState = State.LOADING;
        try {
            const location = await Geolocation.getCurrentPosition();
            if (location === null) throw new RangeError('Location query failed.');
            gpsLoadState = State.SUCCESS;
            return location;
        } catch (err) {
            gpsLoadState = State.FAILURE;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

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

    async function upload() {
        const jwt = cookie.parse(document.cookie).id;
        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'User is not logged in.',
                background: 'variant-filled-error',
            });
            return null;
        }

        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'No API endpoint has been set yet.',
                background: 'variant-filled-error',
            });
            return null;
        }

        const url = await Config.getUrl();
        if (url === null) {
            toast.trigger({
                message: 'No API endpoint has been set yet.',
                background: 'variant-filled-error',
            });
            return null;
        }

        const [
            {
                timestamp,
                coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
            },
            wifi,
            sim,
            strength,
        ] = await Promise.all([getLocation(), scan(), getSim(), getSignalStrength()]);
        assert(sim !== null);
        assert(strength !== null);

        const gps = {
            timestamp: new Date(timestamp),
            latitude,
            longitude,
            coords_accuracy: accuracy,
            altitude,
            altitude_accuracy: altitudeAccuracy ?? null,
            speed,
            heading,
        };

        const body = { gps, wifi, sim, strength };
        try {
            console.log(await Api.uploadReading(url, jwt, body));
        } catch (err) {
            const uri = await Cache.write(body);
            toast.trigger({
                message: `Cached the current readings at ${uri}.`,
                background: 'variant-filled-warning',
            });
            console.error(err);
            return false;
        }

        toast.trigger({
            message: 'Successfully uploaded the data.',
            background: 'variant-filled-success',
        });
        return true;
    }

    let isPending = false;

    async function oneshot() {
        isPending = true;
        try {
            await upload();
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        } finally {
            isPending = false;
        }
    }

    let timeout = null as ReturnType<typeof setTimeout> | null;
    function resetTimeout() {
        if (timeout === null) return;
        clearTimeout(timeout);
        timeout = null;
    }

    let isLoopMode = false;
    async function loop() {
        // Note that `isLoopMode` is modified externally via the `SlideToggle`.
        // eslint-disable-next-line no-unmodified-loop-condition
        while (isLoopMode) {
            isPending = true;
            try {
                const result = await upload();
                if (result === null) break;
            } catch (err) {
                if (err instanceof Error)
                    toast.trigger({
                        message: `${err.name}: ${err.message}`,
                        background: 'variant-filled-error',
                        autohide: false,
                    });
                throw err;
            } finally {
                isPending = false;
            }
            const scanInterval = await Config.getScanInterval();
            const interval = scanInterval ?? 10_000;
            // eslint-disable-next-line no-loop-func
            await new Promise(resolve => {
                timeout = setTimeout(resolve, interval);
            });
            timeout = null;
        }
    }

    async function submitFile(url: URL, path: string, jwt: string, data: Output<typeof Data>) {
        // The ordering of the operations is important here. We emphasize that
        // the cache is only removed after a successful data submission. If the
        // write operation fails (somehow), we are fine with the duplicated data.
        // This is better than the alternative where we delete the reading before
        // a successful transmission, in which case there is the possibility for
        // the data to be deleted yet the transmission fails.
        console.log(await Api.uploadReading(url, jwt, data));
        await Cache.remove(path);
    }

    async function sync() {
        const jwt = cookie.parse(document.cookie).id;
        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'User is not logged in.',
                background: 'variant-filled-error',
                autohide: false,
            });
            return;
        }

        isPending = true;
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
            const promises = files.map(({ path, payload }) => submitFile(url, path, jwt, payload));
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
            isPending = false;
        }
    }

    async function clear() {
        isPending = true;
        try {
            await Cache.clear();
            toast.trigger({
                message: 'Cache cleared.',
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
            isPending = false;
        }
    }
</script>

<div class="space-y-4">
    <SlideToggle
        active="bg-tertiary-400"
        name="loop-mode"
        required
        disabled={isPending}
        bind:checked={isLoopMode}
        on:change={resetTimeout}
    >
        {#if isLoopMode}
            Loop
        {:else}
            Manual
        {/if}
    </SlideToggle>
    <div>
        {#if isLoopMode}
            <button type="button" class="variant-filled-primary btn" on:click={loop} disabled={isPending}>
                <Icon src={ArrowPath} class="h-4" />
                <span>Loop</span>
            </button>
        {:else}
            <button type="button" class="variant-filled-primary btn" on:click={oneshot} disabled={isPending}>
                <Icon src={ArrowUpTray} class="h-4" />
                <span>Upload</span>
            </button>
            <button type="button" class="variant-filled-secondary btn" on:click={sync} disabled={isPending}>
                <Icon src={CloudArrowUp} class="h-4" />
                <span>Sync</span>
            </button>
        {/if}
        <button type="button" class="variant-filled-error btn" on:click={clear} disabled={isPending}>
            <Icon src={Trash} class="h-4" />
            <span>Clear</span>
        </button>
    </div>
    <ul class="list">
        <li>
            <ProgressRadial width="w-8" value={stateToProgress(gpsLoadState)} />
            <span>GPS</span>
        </li>
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
