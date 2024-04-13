import type { CellSignalStrength, SignalStrength } from '$lib/models/cell';
import { type CellType, type Data, HexagonAccessPointCount } from '$lib/models/api';
import { bigint, number, object, parse, string, uuid } from 'valibot';
import { POSTGRES_URL } from '$lib/server/env';
import type { User } from '$lib/jwt';
import { assert } from '$lib/assert';
import { binarySearch } from '$lib/util';
import pg from 'postgres';

// Global (private) connection pool
const sql = pg(POSTGRES_URL, { types: { bigint: pg.BigInt }, ssl: 'prefer' });
type Sql = typeof sql;

const BigId = object({ id: bigint() });
const Uuid = object({ id: string([uuid()]) });
const CountResult = object({ result: number() });
const HexResult = object({ result: HexagonAccessPointCount });

async function computeWifiScore(sql: Sql, longitude: number, latitude: number, resolution = 9, halfLife = 10) {
    const [result, ...rest] =
        await sql`SELECT sum(score) result FROM (SELECT power(.5, count(reading_id)::DOUBLE PRECISION / ${halfLife}) score FROM h3_grid_disk(h3_lat_lng_to_cell(POINT(${longitude}, ${latitude}), ${resolution})) disk LEFT JOIN hotspotter.readings ON disk = h3_lat_lng_to_cell(coords::POINT, ${resolution}) GROUP BY disk) _`;
    assert(rest.length === 0);
    assert(typeof result !== 'undefined');
    return parse(CountResult, result, { abortEarly: true }).result;
}

async function computeCellScore(
    sql: Sql,
    longitude: number,
    latitude: number,
    data: SignalStrength,
    cell: keyof CellSignalStrength,
    resolution = 9,
    halfLife = 10,
) {
    const table = sql(`hotspotter.${cell}` as const);
    const field = sql(`${cell}_id` as const);
    const payload = data[cell];

    const [upload, ...uploadRest] =
        typeof payload === 'undefined'
            ? []
            : await sql`INSERT INTO hotspotter.cdma ${sql(payload)} RETURNING cdma_id id`;
    assert(uploadRest.length === 0);
    const id = typeof upload === 'undefined' ? null : parse(BigId, upload, { abortEarly: true }).id;

    const [result, ...resultRest] =
        await sql`SELECT sum(score) result FROM (SELECT power(.5, count(${field})::DOUBLE PRECISION / ${halfLife}) score FROM h3_grid_disk(h3_lat_lng_to_cell(POINT(${longitude}, ${latitude}), ${resolution})) disk LEFT JOIN hotspotter.readings ON disk = h3_lat_lng_to_cell(coords::POINT, ${resolution}) LEFT JOIN ${table} USING (${field}) GROUP BY disk) _`;
    assert(resultRest.length === 0);
    assert(typeof result !== 'undefined');
    const score = parse(CountResult, result, { abortEarly: true }).result;

    return { id, score };
}

async function insertReading(sql: Sql, sub: string, { gps, sim, wifi }: Data) {
    const compute = computeCellScore.bind(null, sql, gps.longitude, gps.latitude, sim.strength);
    const { id: cdmaId, score: cdmaScore } = await compute('cdma');
    const { id: gsmId, score: gsmScore } = await compute('gsm');
    const { id: lteId, score: lteScore } = await compute('lte');
    const { id: nrId, score: nrScore } = await compute('nr');
    const { id: tdscdmaId, score: tdscdmaScore } = await compute('tdscdma');
    const { id: wcdmaId, score: wcdmaScore } = await compute('wcdma');

    // TODO: Distinguish between `null` and `undefined` as "no data" versus "no hardware".
    const [first, ...rest] =
        await sql`INSERT INTO hotspotter.readings (user_id, gps_timestamp, coords, altitude_level, altitude_accuracy, speed, heading, network_type, carrier_id, operator_id, cell_timestamp, cdma_id, gsm_id, lte_id, nr_id, tdscdma_id, wcdma_id) VALUES (${sub}, ${gps.timestamp}, CIRCLE(POINT(${gps.longitude}, ${gps.latitude}), ${gps.coords_accuracy}), ${gps.altitude}, ${gps.altitude_accuracy ?? null}, ${gps.speed}, ${gps.heading}, ${sim.network_type}, ${sim.carrier_id ?? null}, ${sim.operator_id}, ${sim.strength.timestamp}, ${cdmaId}, ${gsmId}, ${lteId}, ${nrId}, ${tdscdmaId}, ${wcdmaId}) RETURNING reading_id id`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    const { id } = parse(Uuid, first, { abortEarly: true });

    // Wi-Fi
    const wifiScore = await computeWifiScore(sql, gps.longitude, gps.latitude);
    await sql`INSERT INTO hotspotter.wifi ${sql(wifi.map(w => ({ ...w, reading_id: id })))}`;

    // Total Score
    return cdmaScore + gsmScore + lteScore + nrScore + tdscdmaScore + wcdmaScore + wifiScore;
}

export function uploadReadings({ sub, email, name, picture }: User, readings: Data[]) {
    return sql.begin('ISOLATION LEVEL SERIALIZABLE', async sql => {
        await sql`INSERT INTO hotspotter.users (user_id, name, email, picture) VALUES (${sub}, ${name}, ${email}, ${picture}) ON CONFLICT (user_id) DO UPDATE SET email = ${email}, picture = ${picture}`;
        const scores = await Promise.all(readings.map(reading => insertReading(sql, sub, reading)));
        const total = scores.reduce((prev, curr) => prev + curr, 0);
        await sql`UPDATE hotspotter.users SET score = score + ${total} WHERE user_id = ${sub}`;
        return total;
    });
}

/** @deprecated {@linkcode uploadReadings} */
export function uploadReading({ sub, email, name, picture }: User, data: Data) {
    return sql.begin('ISOLATION LEVEL SERIALIZABLE', async sql => {
        await sql`INSERT INTO hotspotter.users (user_id, name, email, picture) VALUES (${sub}, ${name}, ${email}, ${picture}) ON CONFLICT (user_id) DO UPDATE SET email = ${email}, picture = ${picture}`;
        return await insertReading(sql, sub, data);
    });
}

const RESOLUTIONS = [0, 0.022, 0.044, 0.088, 0.352, 0.703, 1.406, 2.813, 5.625, 11.25, 22.5, 45, 90];
export function resolveResolution(minX: number, maxX: number) {
    assert(minX < maxX, 'invalid longitude delta');
    const delta = Math.abs(maxX - minX);
    return RESOLUTIONS.length - binarySearch(RESOLUTIONS, delta) - 1;
}

export async function aggregateAccessPoints(minX: number, minY: number, maxX: number, maxY: number) {
    const resolution = resolveResolution(minX, maxX);
    const [first, ...rest] =
        await sql`SELECT coalesce(jsonb_object_agg(hex, count), '{}') result FROM (SELECT hex, count(DISTINCT (man, ssid)) FROM (SELECT DISTINCT h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex, trunc(bssid) man, ssid FROM hotspotter.wifi JOIN hotspotter.readings USING (reading_id) WHERE ssid <> '' AND coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) uniq GROUP BY hex) _`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    return parse(HexResult, first).result;
}

export async function aggregateCellularLevels(cell: CellType, minX: number, minY: number, maxX: number, maxY: number) {
    const table = sql(`hotspotter.${cell}`);
    const id = sql(`${cell}_id`);
    const resolution = resolveResolution(minX, maxX);
    const [first, ...rest] =
        await sql`SELECT coalesce(jsonb_object_agg(hex, avg), '{}') result FROM (SELECT hex, avg(level)::DOUBLE PRECISION FROM (SELECT h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex, level FROM hotspotter.readings JOIN ${table} USING (${id}) WHERE coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) hist GROUP BY hex) _`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    return parse(HexResult, first).result;
}
