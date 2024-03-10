<script>
    import DisplayCdma from './DisplayCdma.svelte';
    import DisplayEvdo from './DisplayEvdo.svelte';
    import DisplayGsm from './DisplayGsm.svelte';
    import DisplayLte from './DisplayLte.svelte';
    import DisplayNr from './DisplayNr.svelte';
    import DisplayTdscdma from './DisplayTdscdma.svelte';
    import DisplayWcdma from './DisplayWcdma.svelte';

    import DisplayGeolocation from './DisplayGeolocation.svelte';
    import DisplayNetworks from './DisplayNetworks.svelte';
    import DisplaySim from './DisplaySim.svelte';

    import Common from './Common.svelte';
    import Error from '$lib/alerts/Error.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ reading } = data);
</script>

<div class="p-4">
    {#if reading === null}
        <Error>Reading not found. Go back to the <a href="/" class="anchor">home page</a>.</Error>
    {:else}
        {@const {
            gps,
            wifi,
            sim: {
                strength: { cdma, gsm, lte, nr, tdscdma, wcdma },
                ...sim
            },
        } = reading}
        <!-- TODO: Render Timestamp and Level -->
        <div class="space-y-4">
            <DisplayGeolocation {...gps} />
            <DisplayNetworks networks={wifi} />
            <DisplaySim {...sim} />
            {#if typeof cdma !== 'undefined'}
                {@const {
                    level,
                    dbm,
                    asu,
                    cdma_dbm,
                    cdma_ecio,
                    cdma_level,
                    evdo_dbm,
                    evdo_ecio,
                    evdo_level,
                    evdo_snr,
                } = cdma}
                <Common {level} {dbm} {asu} />
                <DisplayCdma dbm={cdma_dbm} ecio={cdma_ecio} level={cdma_level} />
                <DisplayEvdo dbm={evdo_dbm} ecio={evdo_ecio} level={evdo_level} snr={evdo_snr} />
            {/if}
            {#if typeof gsm !== 'undefined'}
                {@const { level, dbm, asu, ...payload } = gsm}
                <Common {level} {dbm} {asu} />
                <DisplayGsm {...payload} />
            {/if}
            {#if typeof lte !== 'undefined'}
                {@const { level, dbm, asu, ...payload } = lte}
                <Common {level} {dbm} {asu} />
                <DisplayLte {...payload} />
            {/if}
            {#if typeof nr !== 'undefined'}
                {@const { level, dbm, asu, ...payload } = nr}
                <Common {level} {dbm} {asu} />
                <DisplayNr {...payload} />
            {/if}
            {#if typeof tdscdma !== 'undefined'}
                {@const { level, dbm, asu, ...payload } = tdscdma}
                <Common {level} {dbm} {asu} />
                <DisplayTdscdma {...payload} />
            {/if}
            {#if typeof wcdma !== 'undefined'}
                {@const { level, dbm, asu, ...payload } = wcdma}
                <Common {level} {dbm} {asu} />
                <DisplayWcdma {...payload} />
            {/if}
        </div>
    {/if}
</div>
