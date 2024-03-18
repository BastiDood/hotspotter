import { type CellType, type Data, HexagonAccessPointCount } from '$lib/models/api';
import { bigint, number, object, parse, string, uuid } from 'valibot';
import { POSTGRES_URL } from '$lib/server/env';
import type { User } from '$lib/jwt';
import { assert } from '$lib/assert';
import { binarySearch } from '$lib/util';
import pg from 'postgres';

// Global (private) connection pool
const sql = pg(POSTGRES_URL, { types: { bigint: pg.BigInt }, ssl: 'prefer' });

const BigId = object({ id: bigint() });
const Uuid = object({ id: string([uuid()]) });
const CountResult = object({ result: number() });
const HexResult = object({ result: HexagonAccessPointCount });

export function uploadReading({ sub, email, name, picture }: User, { gps, sim, wifi }: Data) {
    return sql.begin(async sql => {
        await sql`INSERT INTO hotspotter.users (user_id, name, email, picture) VALUES (${sub}, ${name}, ${email}, ${picture}) ON CONFLICT (user_id) DO UPDATE SET email = ${email}, picture = ${picture}`;
        const [cdma, ...cdmaRest] =
            typeof sim.strength.cdma === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.cdma ${sql(sim.strength.cdma)} RETURNING cdma_id id`;
        assert(cdmaRest.length === 0);
        const cdmaId = typeof cdma === 'undefined' ? null : parse(BigId, cdma, { abortEarly: true }).id;

        const [gsm, ...gsmRest] =
            typeof sim.strength.gsm === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.gsm ${sql(sim.strength.gsm)} RETURNING gsm_id id`;
        assert(gsmRest.length === 0);
        const gsmId = typeof gsm === 'undefined' ? null : parse(BigId, gsm, { abortEarly: true }).id;

        const [lte, ...lteRest] =
            typeof sim.strength.lte === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.lte ${sql(sim.strength.lte)} RETURNING lte_id id`;
        assert(lteRest.length === 0);
        const lteId = typeof lte === 'undefined' ? null : parse(BigId, lte, { abortEarly: true }).id;

        const [nr, ...nrRest] =
            typeof sim.strength.nr === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.nr ${sql(sim.strength.nr)} RETURNING nr_id id`;
        assert(nrRest.length === 0);
        const nrId = typeof nr === 'undefined' ? null : parse(BigId, nr, { abortEarly: true }).id;

        const [tdscdma, ...tdscdmaRest] =
            typeof sim.strength.tdscdma === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.tdscdma ${sql(sim.strength.tdscdma)} RETURNING tdscdma id`;
        assert(tdscdmaRest.length === 0);
        const tdscdmaId = typeof tdscdma === 'undefined' ? null : parse(BigId, tdscdma, { abortEarly: true }).id;

        const [wcdma, ...wcdmaRest] =
            typeof sim.strength.wcdma === 'undefined'
                ? []
                : await sql`INSERT INTO hotspotter.wcdma ${sql(sim.strength.wcdma)} RETURNING wcdma id`;
        assert(wcdmaRest.length === 0);
        const wcdmaId = typeof wcdma === 'undefined' ? null : parse(BigId, wcdma, { abortEarly: true }).id;

        // TODO: Distinguish between `null` and `undefined` as "no data" versus "no hardware".
        const [first, ...rest] =
            await sql`INSERT INTO hotspotter.readings (user_id, gps_timestamp, coords, altitude_level, altitude_accuracy, speed, heading, network_type, carrier_id, operator_id, cell_timestamp, cdma_id, gsm_id, lte_id, nr_id, tdscdma_id, wcdma_id) VALUES (${sub}, ${gps.timestamp}, CIRCLE(POINT(${gps.longitude}, ${gps.latitude}), ${gps.coords_accuracy}), ${gps.altitude}, ${gps.altitude_accuracy}, ${gps.speed}, ${gps.heading}, ${sim.network_type}, ${sim.carrier_id ?? null}, ${sim.operator_id}, ${sim.strength.timestamp}, ${cdmaId}, ${gsmId}, ${lteId}, ${nrId}, ${tdscdmaId}, ${wcdmaId}) RETURNING reading_id id`;
        assert(rest.length === 0);
        assert(typeof first !== 'undefined');
        const { id } = parse(Uuid, first, { abortEarly: true });
        await sql`INSERT INTO hotspotter.wifi ${sql(wifi.map(w => ({ ...w, reading_id: id })))}`;
        return id;
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

export async function computeWifiCellScore(longitude: number, latitude: number) {
    const [first, ...rest] =
        await sql`SELECT sum(score) result FROM (SELECT pi() / 2 - atan(count(index)::DOUBLE PRECISION) score FROM (SELECT * FROM h3_grid_disk(h3_lat_lng_to_cell(POINT(${longitude}, ${latitude}), 9)) index) neighbors LEFT JOIN hotspotter.readings ON index = h3_lat_lng_to_cell(coords::POINT, 9) GROUP BY index) _`;
    assert(rest.length === 0);
    assert(typeof first !== 'undefined');
    return parse(CountResult, first).result;
}
