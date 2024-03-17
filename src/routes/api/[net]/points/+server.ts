import { aggregateAccessPoints, aggregateCellularLevels } from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { CellType } from '$lib/models/api.js';

function extractNumberFromQuery(params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) return null;
    const result = parseFloat(value);
    return isFinite(result) ? result : null;
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
            return null;
    }
}

export async function GET({ url: { searchParams }, params: { net } }) {
    const extract = extractNumberFromQuery.bind(null, searchParams);

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

    const promise =
        selector === CellType.WiFi
            ? aggregateAccessPoints(minX, minY, maxX, maxY)
            : aggregateCellularLevels(selector, minX, minY, maxX, maxY);
    return json(await promise);
}
