import { type Data, DataPoints, HexagonAccessPointAggregation } from '$lib/models/api.ts';
import { type Output, bigint, object, parse, string, uuid } from 'valibot';
import { assert } from '$lib/assert';
import env from '$lib/server/env.ts';
import pg from 'postgres';

// Global (private) connection pool
const sql = pg(env.POSTGRES_URL, { types: { bigint: pg.BigInt }, ssl: 'prefer' });

const BigId = object({ id: bigint() });
const Uuid = object({ id: string([uuid()]) });

export function uploadReading({ gps, sim, strength, wifi }: Output<typeof Data>) {
    return sql.begin(async sql => {
        const [cdma, ...cdmaRest] =
            typeof strength.cdma === 'undefined'
                ? []
                : await sql`INSERT INTO cdma ${sql(strength.cdma)} RETURNING cdma_id id`.execute();
        assert(cdmaRest.length === 0);
        const cdmaId = typeof cdma === 'undefined' ? null : parse(BigId, cdma, { abortEarly: true }).id;

        const [gsm, ...gsmRest] =
            typeof strength.gsm === 'undefined'
                ? []
                : await sql`INSERT INTO gsm ${sql(strength.gsm)} RETURNING gsm_id id`.execute();
        assert(gsmRest.length === 0);
        const gsmId = typeof gsm === 'undefined' ? null : parse(BigId, gsm, { abortEarly: true }).id;

        const [lte, ...lteRest] =
            typeof strength.lte === 'undefined'
                ? []
                : await sql`INSERT INTO lte ${sql(strength.lte)} RETURNING lte_id id`.execute();
        assert(lteRest.length === 0);
        const lteId = typeof lte === 'undefined' ? null : parse(BigId, lte, { abortEarly: true }).id;

        const [nr, ...nrRest] =
            typeof strength.nr === 'undefined'
                ? []
                : await sql`INSERT INTO nr ${sql(strength.nr)} RETURNING nr_id id`.execute();
        assert(nrRest.length === 0);
        const nrId = typeof nr === 'undefined' ? null : parse(BigId, nr, { abortEarly: true }).id;

        const [tdscdma, ...tdscdmaRest] =
            typeof strength.tdscdma === 'undefined'
                ? []
                : await sql`INSERT INTO tdscdma ${sql(strength.tdscdma)} RETURNING tdscdma id`.execute();
        assert(tdscdmaRest.length === 0);
        const tdscdmaId = typeof tdscdma === 'undefined' ? null : parse(BigId, tdscdma, { abortEarly: true }).id;

        const [wcdma, ...wcdmaRest] =
            typeof strength.wcdma === 'undefined'
                ? []
                : await sql`INSERT INTO wcdma ${sql(strength.wcdma)} RETURNING wcdma id`.execute();
        assert(wcdmaRest.length === 0);
        const wcdmaId = typeof wcdma === 'undefined' ? null : parse(BigId, wcdma, { abortEarly: true }).id;

        // TODO: Distinguish between `null` and `undefined` as "no data" versus "no hardware".
        const [first, ...rest] =
            await sql`INSERT INTO readings (gps_timestamp, coords, altitude_level, altitude_accuracy, speed, heading, network_type, carrier_id, operator_id, cell_timestamp, cdma_id, gsm_id, lte_id, nr_id, tdscdma_id, wcdma_id) VALUES (${
                gps.timestamp
            }, CIRCLE(POINT(${gps.longitude}, ${gps.latitude}), ${gps.coords_accuracy}), ${gps.altitude}, ${
                gps.altitude_accuracy
            }, ${gps.speed}, ${gps.heading}, ${sim.network_type}, ${sim.carrier_id ?? null}, ${sim.operator_id}, ${
                strength.timestamp
            }, ${cdmaId}, ${gsmId}, ${lteId}, ${nrId}, ${tdscdmaId}, ${wcdmaId}) RETURNING reading_id id`.execute();

        assert(rest.length === 0);
        assert(typeof first !== 'undefined');
        const { id } = parse(Uuid, first, { abortEarly: true });
        await sql`INSERT INTO wifi ${sql(wifi.map(w => ({ ...w, reading_id: id })))}`;
        return id;
    });
}

export async function fetchCdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT cdma_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE cdma_id IS NOT NULL) _ JOIN cdma USING (cdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchGsmCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT gsm_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE gsm_id IS NOT NULL) _ JOIN gsm USING (gsm_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchLteCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT lte_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE lte_id IS NOT NULL) _ JOIN lte USING (lte_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchNrCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT nr_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE nr_id IS NOT NULL) _ JOIN nr USING (nr_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchTdscdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT tdscdma_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE tdscdma_id IS NOT NULL) _ JOIN tdscdma USING (tdscdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchWcdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT wcdma_id, POINT(coords) p, RADIUS(coords) rad FROM readings WHERE wcdma_id IS NOT NULL) _ JOIN wcdma USING (wcdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

/** Arbitrarily chosen maximum number of polygons in the bounding box of a viewport. */
const MAX_POLYGONS = 2000;

/** @see https://h3geo.org/docs/core-library/restable#average-area-in-m2 */
function resolveResolutionFromComputedHexagonArea(area: number) {
    const desiredArea = area / MAX_POLYGONS;
    if (desiredArea < 0.895) return 15;
    if (desiredArea < 6.267) return 14;
    if (desiredArea < 43.87) return 13;
    if (desiredArea < 307.092) return 12;
    if (desiredArea < 2_149.643) return 11;
    if (desiredArea < 15_047.502) return 10;
    if (desiredArea < 105_332.513) return 9;
    if (desiredArea < 737_327.598) return 8;
    if (desiredArea < 5_161_293.36) return 7;
    if (desiredArea < 36_129_062.164) return 6;
    if (desiredArea < 252_903_858.182) return 5;
    if (desiredArea < 1_770_347_654.491) return 4;
    if (desiredArea < 12_393_434_655.088) return 3;
    if (desiredArea < 86_801_780_398.997) return 2;
    if (desiredArea < 609_788_441_794.134) return 1;
    return 0;
}

export async function aggregateAccessPoints(minX: number, minY: number, maxX: number, maxY: number) {
    const area = (maxX - minX) * (maxY - minY);
    const resolution = resolveResolutionFromComputedHexagonArea(area);
    const [first, ...rest] =
        await sql`SELECT * FROM (SELECT MAX(count), jsonb_agg(hex) hexes FROM (SELECT hex_id, COUNT(DISTINCT bssid)::INT FROM (SELECT reading_id, h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex_id FROM readings WHERE coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) ids JOIN wifi USING (reading_id) WHERE hex_id IS NOT NULL GROUP BY hex_id) hex) _ WHERE _ IS NOT NULL`.execute();
    assert(rest.length === 0);
    return typeof first === 'undefined' ? null : parse(HexagonAccessPointAggregation, first);
}
