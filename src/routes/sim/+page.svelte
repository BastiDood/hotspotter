<script lang="ts">
    import type { CellSignalStrength, SignalStrength, Sim } from '$lib/models/cell';
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
    import type { Output } from 'valibot';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo.ts';

    let sim: Output<typeof Sim> | boolean;
    let signal: Output<typeof SignalStrength> | boolean;
    let cell: Output<typeof CellSignalStrength> | boolean;

    const toast = getToastStore();

    async function refresh(button: HTMLButtonElement) {
        button.disabled = true;
        sim = true;
        signal = true;
        cell = true;
        try {
            [sim, signal, cell] = await Promise.all([
                TelephonyInfo.getSim(),
                TelephonyInfo.getSignalStrength(),
                TelephonyInfo.getSignalStrengths(),
            ]);
        } catch (err) {
            sim = false;
            signal = false;
            cell = false;
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
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => refresh(currentTarget)}>
        <ArrowPathIcon class="h-4" />
        <span>Refresh</span>
    </button>
    <div class="prose max-w-none space-y-4 text-center dark:prose-invert">
        <section>
            <h1>SIM Information</h1>
            {#if typeof sim === 'object'}
                {@const { networkType, carrierId, carrierName, operatorId, operatorName } = sim}
                <DisplaySim {networkType} {carrierId} {carrierName} {operatorId} {operatorName} />
            {:else if sim}
                <ProgressBar />
            {/if}
        </section>
        <section>
            <h1>Aggregated Signal Strength</h1>
            {#if typeof signal === 'object'}
                {@const { timestamp, level } = signal}
                {@const date = new Date(timestamp)}
                <DisplayStrength {date} {level} />
            {:else if signal}
                <ProgressBar />
            {/if}
        </section>
        <section>
            <h1>Signal Quality</h1>
            {#if typeof cell === 'object'}
                {@const { cdma, gsm, lte, nr, tdscdma, wcdma } = cell}
                {#if typeof cdma !== 'undefined'}
                    {@const { dbm, asu, level, cdmaDbm, cdmaEcio, cdmaLevel, evdoDbm, evdoEcio, evdoLevel, evdoSnr } =
                        cdma}
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
                    {@const { dbm, asu, level, csiCqiTableIndex, csiRsrp, csiRsrq, csiSinr, ssRsrp, ssRsrq, ssSinr } =
                        nr}
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
            {:else if cell}
                <ProgressBar />
            {/if}
        </section>
    </div>
</div>
