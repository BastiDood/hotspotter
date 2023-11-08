<script>
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
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import { TelephonyInfo } from '$lib/plugins/TelephonyInfo.ts';
</script>

<div class="prose space-y-4 dark:prose-invert">
    <section>
        <h1>SIM Information</h1>
        {#await TelephonyInfo.getSim()}
            <ProgressBar />
        {:then { networkType, carrierId, carrierName, operatorId, operatorName }}
            <DisplaySim {networkType} {carrierId} {carrierName} {operatorId} {operatorName} />
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
    <section>
        <h1>Aggregated Signal Strength</h1>
        {#await TelephonyInfo.getSignalStrength()}
            <ProgressBar />
        {:then { timestamp, level }}
            {@const date = new Date(timestamp)}
            <DisplayStrength {date} {level} />
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
    {#await TelephonyInfo.getSignalStrengths()}
        <ProgressBar />
    {:then { cdma, gsm, lte, nr, tdscdma, wcdma }}
        {#if typeof cdma !== 'undefined'}
            {@const { dbm, asu, level, cdmaDbm, cdmaEcio, cdmaLevel, evdoDbm, evdoEcio, evdoLevel, evdoSnr } = cdma}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>CDMA</h1>
                    <DisplayCdma dbm={cdmaDbm} ecio={cdmaEcio} level={cdmaLevel} />
                </section>
                <section>
                    <h1>EV-DO</h1>
                    <DisplayEvdo dbm={evdoDbm} ecio={evdoEcio} level={evdoLevel} snr={evdoSnr} />
                </section>
            </div>
        {/if}
        {#if typeof gsm !== 'undefined'}
            {@const { dbm, asu, level, rssi, bitErrorRate, timingAdvance } = gsm}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>GSM</h1>
                    <DisplayGsm {rssi} {bitErrorRate} {timingAdvance} />
                </section>
            </div>
        {/if}
        {#if typeof lte !== 'undefined'}
            {@const { dbm, asu, level, rssi, timingAdvance, cqi, cqiTableIndex, rsrp, rsrq, rssnr } = lte}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>LTE</h1>
                    <DisplayLte {rssi} {timingAdvance} {cqi} {cqiTableIndex} {rsrp} {rsrq} {rssnr} />
                </section>
            </div>
        {/if}
        {#if typeof nr !== 'undefined'}
            {@const { dbm, asu, level, csiCqiTableIndex, csiRsrp, csiRsrq, csiSinr, ssRsrp, ssRsrq, ssSinr } = nr}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>NR</h1>
                    <DisplayNr {csiCqiTableIndex} {csiRsrp} {csiRsrq} {csiSinr} {ssRsrp} {ssRsrq} {ssSinr} />
                </section>
            </div>
        {/if}
        {#if typeof tdscdma !== 'undefined'}
            {@const { dbm, asu, level, rscp } = tdscdma}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>TDSCDMA</h1>
                    <DisplayTdscdma {rscp} />
                </section>
            </div>
        {/if}
        {#if typeof wcdma !== 'undefined'}
            {@const { dbm, asu, level, ecNo } = wcdma}
            <div class="space-m-2 card p-2">
                <section>
                    <h1>Summary</h1>
                    <Common {dbm} {asu} {level} />
                </section>
                <section>
                    <h1>TDSCDMA</h1>
                    <DisplayWcdma {ecNo} />
                </section>
            </div>
        {/if}
    {:catch err}
        <Error>{err}</Error>
    {/await}
</div>
