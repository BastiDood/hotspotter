import { aggregateAccessPoints, aggregateCellularLevels } from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { AssertionError } from '$lib/assert';
import { CellType } from '$lib/models/api';
import { ValiError } from 'valibot';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';

function extractFloat(params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) error(400, `missing query parameter [${query}]`);
    const result = parseFloat(value);
    if (isFinite(result)) return result;
    error(400, `invalid query parameter [${query}]`);
}

function extractOptionalInteger(params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) return null;
    const result = parseInt(value, 10);
    if (Number.isSafeInteger(result)) return result;
    error(400, `invalid query parameter [${query}]`);
}

function extractOptionalDate(params: URLSearchParams, query: string) {
    const value = params.get(query);
    return value === null ? null : new Date(value);
}

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
    const startDate = extractOptionalDate(searchParams, 'start');
    const endDate = extractOptionalDate(searchParams, 'end');
    const operatorPrefix = extractOptionalInteger(searchParams, 'operator');
    try {
        const promise =
            selector === CellType.WiFi
                ? aggregateAccessPoints(minX, minY, maxX, maxY, startDate, endDate)
                : aggregateCellularLevels(selector, minX, minY, maxX, maxY, operatorPrefix, startDate, endDate);
        return json(await promise);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            if (err instanceof pg.PostgresError) {
                console.error(`[PG-${err.code}]: ${err.message}`);
                error(550, err);
            }
            if (err instanceof ValiError) {
                for (const msg of printIssues(err.issues)) console.error(`[${err.name}]: ${msg}`);
                error(551, err);
            }
            if (err instanceof AssertionError) {
                console.error(`[${err.name}]: ${err.message}`);
                error(552, err);
            }
            error(500, err);
        }
        throw err;
    }
}
