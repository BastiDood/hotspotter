<script lang="ts">
    import { array, parse } from 'valibot';
    import { ArrowUpTrayIcon } from '@krowten/svelte-heroicons';
    import { Network } from '$lib/models/wifi';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo';
    import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';
    import { getToastStore } from '@skeletonlabs/skeleton';

    const toast = getToastStore();

    let isWifiDone = null as boolean | null;
    async function scan() {
        isWifiDone = false;
        try {
            const wifi = await WifiWizard2.scan();
            const networks = parse(array(Network), wifi);
            isWifiDone = true;
            return networks;
        } catch (err) {
            isWifiDone = null;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    let isSimDone = null as boolean | null;
    async function getSim() {
        isSimDone = false;
        try {
            const sim = await TelephonyInfo.getSim();
            isSimDone = true;
            return sim;
        } catch (err) {
            isSimDone = null;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    let isSignalDone = null as boolean | null;
    async function getSignalStrength() {
        isSignalDone = false;
        try {
            const signal = await TelephonyInfo.getSignalStrength();
            isSignalDone = true;
            return signal;
        } catch (err) {
            isSignalDone = null;
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        }
    }

    let isCellDone = null as boolean | null;
    async function getSignalStrengths() {
        isCellDone = false;
        try {
            const cell = await TelephonyInfo.getSignalStrengths();
            isCellDone = true;
            return cell;
        } catch (err) {
            isCellDone = null;
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
        try {
            const [wifi, sim, signal, cell] = await Promise.all([
                scan(),
                getSim(),
                getSignalStrength(),
                getSignalStrengths(),
            ]);
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
</div>
