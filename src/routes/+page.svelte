<script lang="ts">
    import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
    import { array, parse } from 'valibot';
    import { ArrowUpTrayIcon } from '@krowten/svelte-heroicons';
    import { Network } from '$lib/models/wifi';
    import { Preferences } from '@capacitor/preferences';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo';
    import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';
    import { assert } from '$lib/assert';

    const enum State {
        NONE,
        LOADING,
        SUCCESS,
        FAILURE,
    }

    function stateToProgress(state: State) {
        switch (state) {
            case State.NONE: return 0;
            case State.LOADING: return 50;
            case State.SUCCESS: return 100;
            case State.FAILURE: return 0;
            default: throw new Error('unexpected state type');
        }
    }

    const toast = getToastStore();

    let wifiLoadState = State.NONE;
    async function scan() {
        wifiLoadState = State.LOADING;
        try {
            const wifi = await WifiWizard2.scan();
            const networks = parse(array(Network), wifi);
            wifiLoadState = State.SUCCESS;
            return networks;
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

    let cellLoadState = State.NONE;
    async function getSignalStrengths() {
        cellLoadState = State.LOADING;
        try {
            const cell = await TelephonyInfo.getSignalStrengths();
            cellLoadState = State.SUCCESS;
            return cell;
        } catch (err) {
            cellLoadState = State.FAILURE;
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
        const { value } = await Preferences.get({ key: 'url' });
        if (value === null) {
            toast.trigger({
                message: 'No API endpoint has been set yet.',
                background: 'variant-filled-error',
                autohide: false,
            });
            return;
        }
        try {
            const [wifi, sim, signal, cell] = await Promise.all([
                scan(),
                getSim(),
                getSignalStrength(),
                getSignalStrengths(),
            ]);
            const response = await fetch(value, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wifi, sim, signal, cell }),
            });
            assert(response.status === 201);
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }
</script>

<div class="space-y-4">
    <button type="button" class="variant-filled-primary btn" on:click={upload}>
        <ArrowUpTrayIcon class="h-4" />
        <span>Upload</span>
    </button>
    <ul class="list">
        <li>
            <ProgressRadial value={stateToProgress(wifiLoadState)} width="w-8" />
            <span>WiFi</span>
        </li>
        <li>
            <ProgressRadial value={stateToProgress(simLoadState)} width="w-8" />
            <span>SIM</span>
        </li>
        <li>
            <ProgressRadial value={stateToProgress(signalLoadState)} width="w-8" />
            <span>Overall Signal Strength</span>
        </li>
        <li>
            <ProgressRadial value={stateToProgress(cellLoadState)} width="w-8" />
            <span>Cellular Signal Strength</span>
        </li>
    </ul>
</div>
