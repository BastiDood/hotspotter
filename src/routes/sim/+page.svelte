<script lang="ts">
    import Common from './Common.svelte';
    import DisplayCdma from './DisplayCdma.svelte';
    import DisplayEvdo from './DisplayEvdo.svelte';
    import DisplayGsm from './DisplayGsm.svelte';
    import DisplayLte from './DisplayLte.svelte';
    import DisplayNr from './DisplayNr.svelte';
    import DisplaySim from './DisplaySim.svelte';
    import DisplayTdscdma from './DisplayTdscdma.svelte';
    import DisplayWcdma from './DisplayWcdma.svelte';
    import { Ratings } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ result } = data);
</script>

<div class="prose max-w-none space-y-4 p-4 text-center dark:prose-invert">
    {#if result !== null}
        {@const { strength, network_type, carrier_id, carrier_name, operator_id, operator_name } = result}
        {@const { level, timestamp, cdma, gsm, lte, nr, tdscdma, wcdma } = strength}
        <section>
            <h1>SIM Information</h1>
            <DisplaySim
                networkType={network_type}
                carrierId={carrier_id}
                carrierName={carrier_name}
                operatorId={operator_id}
                operatorName={operator_name}
            />
        </section>
        <section>
            <h1>Cell Signal Strengths</h1>
            <p>As of {timestamp.toLocaleString()}.</p>
            <Ratings min={0} max={4} value={level} />
            {#if typeof cdma !== 'undefined'}
                {@const {
                    dbm,
                    asu,
                    level,
                    cdma_dbm,
                    cdma_ecio,
                    cdma_level,
                    evdo_dbm,
                    evdo_ecio,
                    evdo_level,
                    evdo_snr,
                } = cdma}
                <div class="card p-2">
                    <div>
                        <h2>Summary</h2>
                        <Common {dbm} {asu} {level} />
                    </div>
                    <div>
                        <h2>CDMA</h2>
                        <DisplayCdma dbm={cdma_dbm} ecio={cdma_ecio} level={cdma_level} />
                    </div>
                    <div>
                        <h2>EV-DO</h2>
                        <DisplayEvdo dbm={evdo_dbm} ecio={evdo_ecio} level={evdo_level} snr={evdo_snr} />
                    </div>
                </div>
            {/if}
            {#if typeof gsm !== 'undefined'}
                {@const { dbm, asu, level, rssi, bit_error_rate, timing_advance } = gsm}
                <div class="card p-2">
                    <h2>GSM</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayGsm {rssi} bitErrorRate={bit_error_rate} timingAdvance={timing_advance} />
                </div>
            {/if}
            {#if typeof lte !== 'undefined'}
                {@const { dbm, asu, level, rssi, timing_advance, cqi, cqi_table_index, rsrp, rsrq, rssnr } = lte}
                <div class="card p-2">
                    <h2>LTE</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayLte
                        timingAdvance={timing_advance}
                        {rssi}
                        {cqi}
                        cqiTableIndex={cqi_table_index}
                        {rsrp}
                        {rsrq}
                        {rssnr}
                    />
                </div>
            {/if}
            {#if typeof nr !== 'undefined'}
                {@const {
                    dbm,
                    asu,
                    level,
                    csi_cqi_report,
                    csi_cqi_table_index,
                    csi_rsrp,
                    csi_rsrq,
                    csi_sinr,
                    ss_rsrp,
                    ss_rsrq,
                    ss_sinr,
                } = nr}
                <div class="card p-2">
                    <h2>NR</h2>
                    <Common {dbm} {asu} {level} />
                    <DisplayNr
                        csiCqiReport={csi_cqi_report}
                        csiCqiTableIndex={csi_cqi_table_index}
                        csiRsrp={csi_rsrp}
                        csiRsrq={csi_rsrq}
                        csiSinr={csi_sinr}
                        ssRsrp={ss_rsrp}
                        ssRsrq={ss_rsrq}
                        ssSinr={ss_sinr}
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
                {@const { dbm, asu, level, ec_no } = wcdma}
                <div class="card p-2">
                    <Common {dbm} {asu} {level} />
                    <h2>WCDMA</h2>
                    <DisplayWcdma ecNo={ec_no} />
                </div>
            {/if}
        </section>
    {/if}
</div>
