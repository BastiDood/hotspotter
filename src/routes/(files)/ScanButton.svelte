<script lang="ts">
    import * as TelephonyInfo from '$lib/plugins/TelephonyInfo';
    import * as WifiInfo from '$lib/plugins/WifiInfo';
    import { ArrowUpOnSquare } from '@steeze-ui/heroicons';
    import type { Data } from '$lib/models/api';
    import { Geolocation } from '@capacitor/geolocation';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { incrementScanCount } from '$lib/plugins/Debounce';
    import { invalidateAll } from '$app/navigation';
    import { write } from '$lib/plugins/Cache';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();
    async function performFullScan() {
        const [
            {
                timestamp,
                coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
            },
            wifi,
            sim,
        ] = await Promise.all([
            Geolocation.getCurrentPosition(),
            WifiInfo.performOneshotScan(),
            TelephonyInfo.getCellQuality(),
        ]);
        assert(sim !== null, 'Telephony plugin not initialized.');
        return {
            gps: {
                timestamp: new Date(timestamp),
                latitude,
                longitude,
                coords_accuracy: accuracy,
                altitude,
                altitude_accuracy: altitudeAccuracy ?? null,
                speed,
                heading,
            },
            wifi,
            sim,
        } satisfies Data;
    }

    async function scan() {
        disabled = true;
        try {
            const body = await performFullScan();
            await incrementScanCount();
            console.log('ScanButton:write', await write(body));
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
        toast.trigger({
            message: 'Successfully uploaded the data.',
            background: 'variant-filled-success',
        });
    }
</script>

<button {disabled} class="variant-filled btn p-4" on:click={scan}>
    <Icon src={ArrowUpOnSquare} theme="outline" class="h-8" />
    <span>Scan</span>
</button>
