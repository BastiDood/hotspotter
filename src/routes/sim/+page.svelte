<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { ArrowPathIcon } from '@krowten/svelte-heroicons';
    import Common from './Common.svelte';
    import DisplayCdma from './DisplayCdma.svelte';
    import DisplayEvdo from './DisplayEvdo.svelte';
    import DisplayGsm from './DisplayGsm.svelte';
    import DisplayLte from './DisplayLte.svelte';
    import DisplayNr from './DisplayNr.svelte';
    import DisplaySim from './DisplaySim.svelte';
    import DisplayStrength from './DisplayStrength.svelte';
    import DisplayTdscdma from './DisplayTdscdma.svelte';
    import DisplayWcdma from './DisplayWcdma.svelte';
    import Error from '$lib/alerts/Error.svelte';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo.ts';

    let sim = TelephonyInfo.getSim();
    let signal = TelephonyInfo.getSignalStrength();
    let cell = TelephonyInfo.getSignalStrengths();

    const toast = getToastStore();
    let isLoading = false;

    async function refresh() {
        isLoading = true;
        try {
            sim = TelephonyInfo.getSim();
            signal = TelephonyInfo.getSignalStrength();
            cell = TelephonyInfo.getSignalStrengths();
            const [
                { networkType, carrierId, carrierName, operatorId, operatorName },
                { timestamp, level: signalStrengthLevel },
                { dbm, asu, level: cellSignalStrengthLevel, cdma, gsm, lte, nr, tdscdma, wcdma },
            ] = await Promise.all([sim, signal, cell]);
        } catch (err) {
            if (!(err instanceof Error)) throw err;
            toast.trigger({
                message: `${err.name}: ${err.message}`,
                background: 'variant-filled-error',
                autohide: false,
            });
        } finally {
            isLoading = false;
        }
    }
</script>

<button type="button" class="variant-filled-primary btn" disabled={isLoading} on:click={refresh}>
    <ArrowPathIcon class="h-4" />
    <span>Refresh</span>
</button>
<div class="prose max-w-none space-y-4 text-center dark:prose-invert">
    <section>
        <h1>SIM Information</h1>
        {#await sim}
            <ProgressBar />
        {:then { networkType, carrierId, carrierName, operatorId, operatorName }}
            <DisplaySim {networkType} {carrierId} {carrierName} {operatorId} {operatorName} />
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
    <section>
        <h1>Aggregated Signal Strength</h1>
        {#await signal}
            <ProgressBar />
        {:then { timestamp, level }}
            {@const date = new Date(timestamp)}
            <DisplayStrength {date} {level} />
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
    <section>
        <h1>Signal Quality</h1>
        {#await cell}
            <ProgressBar />
        {:then { cdma, gsm, lte, nr, tdscdma, wcdma }}
            {#if typeof cdma !== 'undefined'}
                {@const { dbm, asu, level, cdmaDbm, cdmaEcio, cdmaLevel, evdoDbm, evdoEcio, evdoLevel, evdoSnr } = cdma}
                <div class="card p-2">
                    <div>
                        <h2>Summary</h2>
                        <Common {dbm} {asu} {level} />
                    </div>
                    <div>
                        <h2>CDMA</h2>
                        <DisplayCdma dbm={cdmaDbm} ecio={cdmaEcio} level={cdmaLevel} />
                    </div>
                    <div>
                        <h2>EV-DO</h2>
                        <DisplayEvdo dbm={evdoDbm} ecio={evdoEcio} level={evdoLevel} snr={evdoSnr} />
                    </div>
                </div>
            {/if}
            {#if typeof gsm !== 'undefined'}
                {@const { dbm, asu, level, rssi, bitErrorRate, timingAdvance } = gsm}
                <div class="card p-2">
                    <h2>GSM</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayGsm {rssi} {bitErrorRate} {timingAdvance} />
                </div>
            {/if}
            {#if typeof lte !== 'undefined'}
                {@const { dbm, asu, level, rssi, timingAdvance, cqi, cqiTableIndex, rsrp, rsrq, rssnr } = lte}
                <div class="card p-2">
                    <h2>LTE</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayLte {rssi} {timingAdvance} {cqi} {cqiTableIndex} {rsrp} {rsrq} {rssnr} />
                </div>
            {/if}
            {#if typeof nr !== 'undefined'}
                {@const { dbm, asu, level, csiCqiTableIndex, csiRsrp, csiRsrq, csiSinr, ssRsrp, ssRsrq, ssSinr } = nr}
                <div class="card p-2">
                    <h2>NR</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayNr {csiCqiTableIndex} {csiRsrp} {csiRsrq} {csiSinr} {ssRsrp} {ssRsrq} {ssSinr} />
                </div>
            {/if}
            {#if typeof tdscdma !== 'undefined'}
                {@const { dbm, asu, level, rscp } = tdscdma}
                <div class="card p-2">
                    <h2>TDSCDMA</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayTdscdma {rscp} />
                </div>
            {/if}
            {#if typeof wcdma !== 'undefined'}
                {@const { dbm, asu, level, ecNo } = wcdma}
                <div class="card p-2">
                    <Common {dbm} {asu} {level} />
                    <h2>WCDMA</h2>
                    <DisplayWcdma {ecNo} />
                </div>
            {/if}
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
</div>
