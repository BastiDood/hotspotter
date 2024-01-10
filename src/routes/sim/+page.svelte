<script lang="ts">
    import { ProgressRadial, Ratings } from '@skeletonlabs/skeleton';
    import { getSignalStrength, getSim } from '$lib/plugins/TelephonyInfo';
    import Common from './Common.svelte';
    import DisplayCdma from './DisplayCdma.svelte';
    import DisplayEvdo from './DisplayEvdo.svelte';
    import DisplayGsm from './DisplayGsm.svelte';
    import DisplayLte from './DisplayLte.svelte';
    import DisplayNr from './DisplayNr.svelte';
    import DisplaySim from './DisplaySim.svelte';
    import DisplayTdscdma from './DisplayTdscdma.svelte';
    import DisplayWcdma from './DisplayWcdma.svelte';
    import Error from '$lib/alerts/Error.svelte';
</script>

<div class="prose max-w-none space-y-4 text-center dark:prose-invert">
    <section>
        <h1>SIM Information</h1>
        {#await getSim()}
            <div class="flex h-full items-center justify-center">
                <ProgressRadial />
            </div>
        {:then { network_type, carrier_id, carrier_name, operator_id, operator_name }}
            <DisplaySim
                networkType={network_type}
                carrierId={carrier_id}
                carrierName={carrier_name}
                operatorId={operator_id}
                operatorName={operator_name}
            />
        {:catch err}
            <Error>{err}</Error>
        {/await}
    </section>
    {#await getSignalStrength()}
        <div class="flex h-full items-center justify-center">
            <ProgressRadial />
        </div>
    {:then strength}
        {@const { timestamp, level, cdma, gsm, lte, nr, tdscdma, wcdma } = strength}
        <section>
            <h1>Cell Signal Strengths</h1>
            <p>As of {timestamp.toLocaleString()}.</p>
            <Ratings min={0} max={4} value={level} />
            {#if typeof cdma !== 'undefined'}
                {@const {
                    dbm,
                    asu,
                    level,
                    cdma_dbm: cdmaDbm,
                    cdma_ecio: cdmaEcio,
                    cdma_level: cdmaLevel,
                    evdo_dbm: evdoDbm,
                    evdo_ecio: evdoEcio,
                    evdo_level: evdoLevel,
                    evdo_snr: evdoSnr,
                } = cdma}
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
                {@const { dbm, asu, level, rssi, bit_error_rate: bitErrorRate, timing_advance: timingAdvance } = gsm}
                <div class="card p-2">
                    <h2>GSM</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayGsm {rssi} {bitErrorRate} {timingAdvance} />
                </div>
            {/if}
            {#if typeof lte !== 'undefined'}
                {@const {
                    dbm,
                    asu,
                    level,
                    rssi,
                    timing_advance: timingAdvance,
                    cqi,
                    cqi_table_index: cqiTableIndex,
                    rsrp,
                    rsrq,
                    rssnr,
                } = lte}
                <div class="card p-2">
                    <h2>LTE</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayLte {timingAdvance} {rssi} {cqi} {cqiTableIndex} {rsrp} {rsrq} {rssnr} />
                </div>
            {/if}
            {#if typeof nr !== 'undefined'}
                {@const {
                    dbm,
                    asu,
                    level,
                    csi_cqi_report: csiCqiReport,
                    csi_cqi_table_index: csiCqiTableIndex,
                    csi_rsrp: csiRsrp,
                    csi_rsrq: csiRsrq,
                    csi_sinr: csiSinr,
                    ss_rsrp: ssRsrp,
                    ss_rsrq: ssRsrq,
                    ss_sinr: ssSinr,
                } = nr}
                <div class="card p-2">
                    <h2>NR</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayNr
                        {csiCqiReport}
                        {csiCqiTableIndex}
                        {csiRsrp}
                        {csiRsrq}
                        {csiSinr}
                        {ssRsrp}
                        {ssRsrq}
                        {ssSinr}
                    />
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
                {@const { dbm, asu, level, ec_no: ecNo } = wcdma}
                <div class="card p-2">
                    <Common {dbm} {asu} {level} />
                    <h2>WCDMA</h2>
                    <DisplayWcdma {ecNo} />
                </div>
            {/if}
        </section>
    {:catch err}
        <Error>{err}</Error>
    {/await}
</div>
