import { CellSignalStrength, type SignalStrength } from '$lib/models/cell';
import { type CellType, type Data, HexagonAccessPointCount, LeaderboardUsers, UserRankScore } from '$lib/models/api';
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

/**
 * Comptues the Wi-Fi multiplier score between `0` and `1`. Note that only cells fresher than two weeks
 * are considered for scoring. This allows us to incentivize users to update stale data points.
 */
async function computeWifiMultiplier(sql: Sql, longitude: number, latitude: number, resolution = 9, halfLife = 10) {
    // TODO: Consider age of stalest data in score computation.
    const [result, ...rest] =
        await sql`SELECT exp(coalesce(sum(ln(score)), 0)) result FROM (SELECT power(.5, count(reading_id)::DOUBLE PRECISION / ${halfLife}) score FROM h3_grid_disk(h3_lat_lng_to_cell(POINT(${longitude}, ${latitude}), ${resolution})) disk LEFT JOIN (SELECT reading_id, coords, min(wifi_timestamp) wifi_timestamp FROM hotspotter.readings JOIN hotspotter.wifi USING (reading_id) GROUP BY reading_id) readings ON disk = h3_lat_lng_to_cell(coords::POINT, ${resolution}) WHERE NOW() - INTERVAL '2W' < wifi_timestamp GROUP BY disk) _`;
    assert(rest.length === 0);
    assert(typeof result !== 'undefined');
    return parse(CountResult, result, { abortEarly: true }).result;
}

/**
 * Comptues the cell multiplier score between 0 and 1. Also inserts the cell into the database afterward.
 * Note that only cells fresher than one week are considered for scoring. This allows us to incentivize
 * users to update stale data points.
 */
async function computeCellMultiplierThenInsert(
    sql: Sql,
    longitude: number,
    latitude: number,
    data: SignalStrength,
    cell: keyof CellSignalStrength,
    resolution = 9,
    halfLife = 10,
) {
    // TODO: Consider age of stalest data in score computation.
    const table = sql(`hotspotter.${cell}` as const);
    const field = sql(`${cell}_id` as const);
    const payload = data[cell];

    const [result, ...resultRest] =
        await sql`SELECT exp(coalesce(sum(ln(score)), 0)) result FROM (SELECT power(.5, count(${field})::DOUBLE PRECISION / ${halfLife}) score FROM h3_grid_disk(h3_lat_lng_to_cell(POINT(${longitude}, ${latitude}), ${resolution})) disk LEFT JOIN hotspotter.readings ON disk = h3_lat_lng_to_cell(coords::POINT, ${resolution}) LEFT JOIN ${table} USING (${field}) WHERE NOW() - INTERVAL '1W' < cell_timestamp GROUP BY disk) _`;
    assert(resultRest.length === 0);
    assert(typeof result !== 'undefined');
    const multiplier = parse(CountResult, result, { abortEarly: true }).result;

    const [upload, ...uploadRest] =
        typeof payload === 'undefined' ? [] : await sql`INSERT INTO ${table} ${sql(payload)} RETURNING ${field} id`;
    assert(uploadRest.length === 0);
    const id = typeof upload === 'undefined' ? null : parse(BigId, upload, { abortEarly: true }).id;

    return { id, multiplier };
}

async function insertReading(sql: Sql, sub: string, { gps, sim, wifi }: Data) {
    const computeThenInsert = computeCellMultiplierThenInsert.bind(
        null,
        sql,
        gps.longitude,
        gps.latitude,
        sim.strength,
    );
    const { id: cdmaId, multiplier: cdmaMultiplier } = await computeThenInsert('cdma');
    const { id: gsmId, multiplier: gsmMultiplier } = await computeThenInsert('gsm');
    const { id: lteId, multiplier: lteMultiplier } = await computeThenInsert('lte');
    const { id: nrId, multiplier: nrMultiplier } = await computeThenInsert('nr');
    const { id: tdscdmaId, multiplier: tdscdmaMultiplier } = await computeThenInsert('tdscdma');
    const { id: wcdmaId, multiplier: wcdmaMultiplier } = await computeThenInsert('wcdma');

    // TODO: Distinguish between `null` and `undefined` as "no data" versus "no hardware".
    const [first, ...rest] =
        await sql`INSERT INTO hotspotter.readings (user_id, gps_timestamp, coords, altitude_level, altitude_accuracy, speed, heading, network_type, carrier_id, operator_id, cell_timestamp, cdma_id, gsm_id, lte_id, nr_id, tdscdma_id, wcdma_id) VALUES (${sub}, ${gps.timestamp}, CIRCLE(POINT(${gps.longitude}, ${gps.latitude}), ${gps.coords_accuracy}), ${gps.altitude}, ${gps.altitude_accuracy ?? null}, ${gps.speed}, ${gps.heading}, ${sim.network_type}, ${sim.carrier_id ?? null}, ${sim.operator_id}, ${sim.strength.timestamp}, ${cdmaId}, ${gsmId}, ${lteId}, ${nrId}, ${tdscdmaId}, ${wcdmaId}) RETURNING reading_id id`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    const { id } = parse(Uuid, first, { abortEarly: true });

    // Wi-Fi
    const wifiMultiplier = await computeWifiMultiplier(sql, gps.longitude, gps.latitude);
    const wifiRaw =
        wifi.length > 0
            ? (await sql`INSERT INTO hotspotter.wifi ${sql(wifi.map(w => ({ ...w, reading_id: id })))}`, 1)
            : 0;

    // Total Score
    const cdmaScore = cdmaMultiplier * (cdmaId === null ? 0 : 1);
    const gsmScore = gsmMultiplier * (gsmId === null ? 0 : 1);
    const lteScore = lteMultiplier * (lteId === null ? 0 : 1);
    const nrScore = nrMultiplier * (nrId === null ? 0 : 1);
    const tdscdmaScore = tdscdmaMultiplier * (tdscdmaId === null ? 0 : 1);
    const wcdmaScore = wcdmaMultiplier * (wcdmaId === null ? 0 : 1);
    const wifiScore = wifiMultiplier * wifiRaw;
    return 10 * (cdmaScore + gsmScore + lteScore + nrScore + tdscdmaScore + wcdmaScore + wifiScore);
}

export function uploadReadings({ sub, email, name, picture }: User, readings: Data[]) {
    return sql.begin(async sql => {
        await sql`INSERT INTO hotspotter.users (user_id, name, email, picture) VALUES (${sub}, ${name}, ${email}, ${picture}) ON CONFLICT (user_id) DO UPDATE SET email = ${email}, picture = ${picture}`;
        const scores = await Promise.all(readings.map(reading => insertReading(sql, sub, reading)));
        const total = scores.reduce((prev, curr) => prev + curr, 0);
        await sql`UPDATE hotspotter.users SET score = score + ${total} WHERE user_id = ${sub}`;
        return total;
    });
}

/** @deprecated {@linkcode uploadReadings} */
export function uploadReading({ sub, email, name, picture }: User, data: Data) {
    return sql.begin(async sql => {
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

/** @param age Only filter for {@linkcode age} days back. Leave `null` to get all data. */
export async function aggregateAccessPoints(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    age: number | null,
) {
    const resolution = resolveResolution(minX, maxX);
    const interval = age === null ? sql`TRUE` : sql`NOW() - make_interval(days => ${age}) < ts`;
    const [first, ...rest] =
        await sql`SELECT coalesce(jsonb_object_agg(hex, count), '{}') result FROM (SELECT hex, count(DISTINCT (man, ssid)), min(wifi_timestamp) ts FROM (SELECT DISTINCT h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex, trunc(bssid) man, ssid, wifi_timestamp FROM hotspotter.wifi JOIN hotspotter.readings USING (reading_id) WHERE ssid <> '' AND coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) uniq GROUP BY hex) _ WHERE ${interval}`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    return parse(HexResult, first).result;
}

/** @param age Only filter for {@linkcode age} days back. Leave `null` to get all data. */
export async function aggregateCellularLevels(
    cell: CellType,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    age: number | null,
) {
    const table = sql(`hotspotter.${cell}`);
    const id = sql(`${cell}_id`);
    const resolution = resolveResolution(minX, maxX);
    const interval = age === null ? sql`TRUE` : sql`NOW() - make_interval(days => ${age}) < cell_timestamp`;
    const [first, ...rest] =
        await sql`SELECT coalesce(jsonb_object_agg(hex, avg), '{}') result FROM (SELECT hex, avg(level)::DOUBLE PRECISION FROM (SELECT h3_lat_lng_to_cell(coords::POINT, ${resolution}) hex, level FROM hotspotter.readings JOIN ${table} USING (${id}) WHERE ${interval} AND coords::POINT <@ BOX(POINT(${minX}, ${minY}), POINT(${maxX}, ${maxY}))) hist GROUP BY hex) _`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    return parse(HexResult, first).result;
}

// TODO: Integrate into the user profile.
export async function fetchUserScore(id: string) {
    const [first, ...rest] =
        await sql`SELECT rank() OVER (ORDER BY score DESC), score FROM hotspotter.users WHERE user_id = ${id}`;
    assert(rest.length === 0);
    return typeof first === 'undefined' ? null : parse(UserRankScore, first, { abortEarly: true });
}

export async function fetchLeaderboard(limit = 25) {
    const users =
        await sql`SELECT rank() OVER (ORDER BY score DESC), name, picture, score FROM hotspotter.users WHERE score > 0 ORDER BY score DESC LIMIT ${limit};`;
    assert(users.length <= limit);
    return parse(LeaderboardUsers, users, { abortEarly: true });
}
