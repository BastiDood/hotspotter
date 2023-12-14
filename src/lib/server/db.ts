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
                : await sql`INSERT INTO hotspotter.cdma ${sql(strength.cdma)} RETURNING cdma_id id`.execute();
        assert(cdmaRest.length === 0);
        const cdmaId = typeof cdma === 'undefined' ? null : parse(BigId, cdma, { abortEarly: true }).id;

        const [gsm, ...gsmRest] =
            typeof strength.gsm === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.gsm ${sql(strength.gsm)} RETURNING gsm_id id`.execute();
        assert(gsmRest.length === 0);
        const gsmId = typeof gsm === 'undefined' ? null : parse(BigId, gsm, { abortEarly: true }).id;

        const [lte, ...lteRest] =
            typeof strength.lte === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.lte ${sql(strength.lte)} RETURNING lte_id id`.execute();
        assert(lteRest.length === 0);
        const lteId = typeof lte === 'undefined' ? null : parse(BigId, lte, { abortEarly: true }).id;

        const [nr, ...nrRest] =
            typeof strength.nr === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.nr ${sql(strength.nr)} RETURNING nr_id id`.execute();
        assert(nrRest.length === 0);
        const nrId = typeof nr === 'undefined' ? null : parse(BigId, nr, { abortEarly: true }).id;

        const [tdscdma, ...tdscdmaRest] =
            typeof strength.tdscdma === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.tdscdma ${sql(strength.tdscdma)} RETURNING tdscdma id`.execute();
        assert(tdscdmaRest.length === 0);
        const tdscdmaId = typeof tdscdma === 'undefined' ? null : parse(BigId, tdscdma, { abortEarly: true }).id;

        const [wcdma, ...wcdmaRest] =
            typeof strength.wcdma === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.wcdma ${sql(strength.wcdma)} RETURNING wcdma id`.execute();
        assert(wcdmaRest.length === 0);
        const wcdmaId = typeof wcdma === 'undefined' ? null : parse(BigId, wcdma, { abortEarly: true }).id;

        // TODO: Distinguish between `null` and `undefined` as "no data" versus "no hardware".
        const [first, ...rest] =
            await sql`INSERT INTO hotspotter.readings (gps_timestamp, coords, altitude_level, altitude_accuracy, speed, heading, network_type, carrier_id, operator_id, cell_timestamp, cdma_id, gsm_id, lte_id, nr_id, tdscdma_id, wcdma_id) VALUES (${
                gps.timestamp
            }, CIRCLE(POINT(${gps.longitude}, ${gps.latitude}), ${gps.coords_accuracy}), ${gps.altitude}, ${
                gps.altitude_accuracy
            }, ${gps.speed}, ${gps.heading}, ${sim.network_type}, ${sim.carrier_id ?? null}, ${sim.operator_id}, ${
                strength.timestamp
            }, ${cdmaId}, ${gsmId}, ${lteId}, ${nrId}, ${tdscdmaId}, ${wcdmaId}) RETURNING reading_id id`.execute();

        assert(rest.length === 0);
        assert(typeof first !== 'undefined');
        const { id } = parse(Uuid, first, { abortEarly: true });
        await sql`INSERT INTO hotspotter.wifi ${sql(wifi.map(w => ({ ...w, reading_id: id })))}`;
        return id;
    });
}

export async function fetchCdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT cdma_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE cdma_id IS NOT NULL) _ JOIN hotspotter.cdma USING (cdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchGsmCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT gsm_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE gsm_id IS NOT NULL) _ JOIN hotspotter.gsm USING (gsm_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchLteCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT lte_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE lte_id IS NOT NULL) _ JOIN hotspotter.lte USING (lte_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchNrCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT nr_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE nr_id IS NOT NULL) _ JOIN hotspotter.nr USING (nr_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchTdscdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT tdscdma_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE tdscdma_id IS NOT NULL) _ JOIN hotspotter.tdscdma USING (tdscdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

export async function fetchWcdmaCoords() {
    const rows =
        await sql`SELECT level, p[0] lon, p[1] lat, rad FROM (SELECT wcdma_id, POINT(coords) p, RADIUS(coords) rad FROM hotspotter.readings WHERE wcdma_id IS NOT NULL) _ JOIN hotspotter.wcdma USING (wcdma_id)`.execute();
    return parse(DataPoints, rows, { abortEarly: true });
}

/** Approximation of the equatorial radius in meters. */
const EARTH_RADIUS = 6_378_137;

function toRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function haversine(minX: number, minY: number, maxX: number, maxY: number) {
    const dLon = toRadians(maxX - minX);
    const dLat = toRadians(maxY - minY);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(minY)) * Math.cos(toRadians(maxY)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** @see https://h3geo.org/docs/core-library/restable#average-area-in-m2 */
function resolveResolutionFromComputedHexagonArea(area: number) {
    if (area < 60) return 15;
    if (area < 200) return 14;
    if (area < 600) return 13;
    if (area < 1_300) return 12;
    if (area < 3_200) return 11;
    if (area < 9_500) return 10;
    if (area < 18_500) return 9;
    if (area < 42_500) return 8;
    if (area < 120_000) return 7;
    if (area < 300_000) return 6;
    if (area < 960_000) return 5;
    if (area < 3_000_000) return 4;
    if (area < 5_800_000) return 3;
    if (area < 12_500_000) return 2;
    if (area < 18_000_000) return 1;
    return 0;
}

export async function aggregateAccessPoints(minX: number, minY: number, maxX: number, maxY: number) {
    const area = haversine(minX, minY, maxX, maxY);
    const resolution = resolveResolutionFromComputedHexagonArea(area);
    const [first, ...rest] =
        await sql`SELECT * FROM (SELECT MAX(count), jsonb_agg(hex) hexes FROM (SELECT hex_id, COUNT(DISTINCT bssid)::INT FROM (SELECT reading_id, h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex_id FROM hotspotter.readings WHERE coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) ids JOIN hotspotter.wifi USING (reading_id) WHERE hex_id IS NOT NULL GROUP BY hex_id) hex) _ WHERE _ IS NOT NULL`.execute();
    assert(rest.length === 0);
    return typeof first === 'undefined' ? null : parse(HexagonAccessPointAggregation, first);
}
