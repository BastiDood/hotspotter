import { aggregateAccessPoints, aggregateCellularLevels } from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { CellType } from '$lib/models/api.js';

function parseInteger(num: string) {
    return parseInt(num, 10);
}

function extractNumberFromQuery(parse: typeof parseFloat, params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) return null;
    const result = parse(value);
    return isFinite(result) ? result : null;
}

const extractFloat = extractNumberFromQuery.bind(null, parseFloat);
const extractInteger = extractNumberFromQuery.bind(null, parseInteger);

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
            return null;
    }
}

export async function GET({ url: { searchParams }, params: { net } }) {
    const extract = extractFloat.bind(null, searchParams);

    const minX = extract('min-x');
    if (minX === null) error(400, 'invalid min-x');

    const minY = extract('min-y');
    if (minY === null) error(400, 'invalid min-y');

    const maxX = extract('max-x');
    if (maxX === null) error(400, 'invalid max-x');

    const maxY = extract('max-y');
    if (maxY === null) error(400, 'invalid max-y');

    const selector = resolveSelector(net);
    if (selector === null) error(400, 'invalid network type');

    const age = extractInteger(searchParams, 'age');
    const promise =
        selector === CellType.WiFi
            ? aggregateAccessPoints(minX, minY, maxX, maxY, age)
            : aggregateCellularLevels(selector, minX, minY, maxX, maxY, age);
    return json(await promise);
}
