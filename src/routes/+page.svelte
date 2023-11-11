<script lang="ts">
    import * as TelephonyInfo from '$lib/plugins/TelephonyInfo';
    import * as Wifi from '$lib/plugins/WifiWizard';
    import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
    import { ArrowUpTrayIcon } from '@krowten/svelte-heroicons';
    import { Preferences } from '@capacitor/preferences';
    import { assert } from '$lib/assert';

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
            const wifi = await Wifi.scan();
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

    async function upload(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const { value } = await Preferences.get({ key: 'url' });
            if (value === null) {
                toast.trigger({
                    message: 'No API endpoint has been set yet.',
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return;
            }
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
</script>

<div class="space-y-4">
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => upload(currentTarget)}>
        <ArrowUpTrayIcon class="h-4" />
        <span>Upload</span>
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
            <span>Overall Signal Strength</span>
        </li>
        <li>
            <ProgressRadial width="w-8" value={stateToProgress(cellLoadState)} />
            <span>Cellular Signal Strength</span>
        </li>
    </ul>
</div>
