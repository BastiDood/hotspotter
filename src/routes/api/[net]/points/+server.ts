import { aggregateAccessPoints, aggregateCellularLevels } from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { CellType } from '$lib/models/api';
import { ValiError } from 'valibot';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';

function parseInteger(num: string) {
    return parseInt(num, 10);
}

function extractNumberFromQuery(parse: typeof parseFloat, params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) error(400, `missing query parameter [${query}]`);
    const result = parse(value);
    if (isFinite(result)) return result;
    error(400, `invalid query parameter [${query}]`);
}

function extractOptionalNumberFromQuery(parse: typeof parseFloat, params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) return null;
    const result = parse(value);
    if (isFinite(result)) return result;
    error(400, `invalid query parameter [${query}]`);
}

const extractFloat = extractNumberFromQuery.bind(null, parseFloat);
const extractOptionalInteger = extractOptionalNumberFromQuery.bind(null, parseInteger);

function resolveSelector(net: string) {
    switch (net) {
        case 'wifi':
            return CellType.WiFi;
        case 'gsm':
            return CellType.Gsm;
        case 'cdma':
            return CellType.Cdma;
        case 'tdscdma':
            return CellType.Tdscdma;
        case 'wcdma':
            return CellType.Wcdma;
        case 'lte':
            return CellType.Lte;
        case 'nr':
            return CellType.Nr;
        default:
            error(400, 'unknown cell type');
    }
}

export async function GET({ url: { searchParams }, params: { net } }) {
    const selector = resolveSelector(net);
    const minX = extractFloat(searchParams, 'min-x');
    const minY = extractFloat(searchParams, 'min-y');
    const maxX = extractFloat(searchParams, 'max-x');
    const maxY = extractFloat(searchParams, 'max-y');
    const age = extractOptionalInteger(searchParams, 'age');
    try {
        const promise =
            selector === CellType.WiFi
                ? aggregateAccessPoints(minX, minY, maxX, maxY, age)
                : aggregateCellularLevels(selector, minX, minY, maxX, maxY, age);
        return json(await promise);
    } catch (err) {
        if (err instanceof pg.PostgresError) {
            console.error(`[PG-${err.code}]: ${err.message}`);
            error(550, err);
        } else if (err instanceof ValiError) {
            printIssues(err.issues);
            error(551, err);
        }
        throw err;
    }
}
