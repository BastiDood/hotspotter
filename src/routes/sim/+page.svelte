<script lang="ts">
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
    import type { PageData } from './$types';
    import { addScanListener } from '$lib/plugins/TelephonyInfo';
    import { browser } from '$app/environment';
    import { onNavigate } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ sim, strength } = data);

    if (browser) {
        const listener = addScanListener(info => (strength = info));
        onNavigate(async () => {
            const handle = await listener;
            await handle.remove();
        });
    }
</script>

<div class="prose max-w-none space-y-4 text-center dark:prose-invert">
    <section>
        <h1>SIM Information</h1>
        {#if typeof sim !== 'undefined'}
            {@const { networkType, carrierId, carrierName, operatorId, operatorName } = sim}
            <DisplaySim {networkType} {carrierId} {carrierName} {operatorId} {operatorName} />
        {/if}
    </section>
    {#if typeof strength !== 'undefined'}
        {@const { timestamp, level, cdma, gsm, lte, nr, tdscdma, wcdma } = strength}
        <section>
            <h1>Signal Strength</h1>
            <DisplayStrength {timestamp} {level} />
        </section>
        <section>
            <h1>Cell Signal Strengths</h1>
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
        </section>
    {/if}
</div>
