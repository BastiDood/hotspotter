<script lang="ts">
    import * as Cache from '$lib/plugins/Cache';
    import * as Config from '$lib/plugins/Config';
    import * as Http from '$lib/http';
    import * as TelephonyInfo from '$lib/plugins/TelephonyInfo';
    import * as WifiInfo from '$lib/plugins/WifiInfo';
    import { ArrowUpOnSquare } from '@steeze-ui/heroicons';
    import { Geolocation } from '@capacitor/geolocation';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { assert } from '$lib/assert';
    import cookie from 'cookie';
    import { getToastStore } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let disabled: boolean;

    const toast = getToastStore();
    function sendToastOnError(err: unknown): never {
        if (err instanceof Error)
            toast.trigger({
                message: err.message,
                background: 'variant-filled-success',
                autohide: false,
            });
        throw err;
    }

    async function performFulScan() {
        const [
            {
                timestamp,
                coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading },
            },
            wifi,
            sim,
        ] = await Promise.all([
            Geolocation.getCurrentPosition().catch(sendToastOnError),
            WifiInfo.performOneshotScan().catch(sendToastOnError),
            TelephonyInfo.getCellQuality().catch(sendToastOnError),
        ]);
        assert(sim !== null, 'telephony plugin not initialized');
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
        return { gps, wifi, sim };
    }

    async function upload() {
        const jwt = cookie.parse(document.cookie).id;
        if (typeof jwt === 'undefined') {
            toast.trigger({
                message: 'User is not logged in.',
                background: 'variant-filled-error',
            });
            return;
        }

        disabled = true;
        try {
            const url = await Config.getUrl();
            if (url === null) {
                toast.trigger({
                    message: 'No API endpoint has been set yet.',
                    background: 'variant-filled-error',
                });
                return;
            }

            const body = await performFulScan();
            try {
                console.log(await Http.uploadReading(url, jwt, body));
            } catch (err) {
                const uri = await Cache.write(body);
                toast.trigger({
                    message: `Cached the current readings at ${uri}.`,
                    background: 'variant-filled-warning',
                });
                if (err instanceof Error)
                    toast.trigger({
                        message: err.message,
                        background: 'variant-filled-error',
                        autohide: false,
                    });
                throw err;
            }

            toast.trigger({
                message: 'Successfully uploaded the data.',
                background: 'variant-filled-success',
            });
        } finally {
            disabled = false;
        }
    }
</script>

<button {disabled} class="variant-filled btn p-4" on:click={upload}>
    <Icon src={ArrowUpOnSquare} theme="outline" class="h-8" />
    <span>Send &#38; Scan</span>
</button>
