import { type Data, DataPoints, HexagonAccessPointAggregation } from '$lib/models/api';
import { type Output, parse } from 'valibot';
import { assert } from './assert';

export async function uploadReading(http: typeof fetch, base: URL, data: Output<typeof Data>) {
    const url = new URL('api/reading', base);
    const response = await http(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    assert(response.status === 201);
    return response.text();
}

export const enum MarkerMode {
    Cdma = 'cdma',
    Gsm = 'gsm',
    Lte = 'lte',
    Nr = 'nr',
    Tdscdma = 'tdscdma',
    Wcdma = 'wcdma',
}

export async function fetchMarkers(http: typeof fetch, base: URL, mode: MarkerMode) {
    const response = await http(new URL(`api/level/${mode}`, base));
    assert(response.status === 200);
    const json = await response.json();
    return parse(DataPoints, json, { abortEarly: true });
}

export async function fetchHexagonAccessPoints(
    http: typeof fetch,
    base: URL,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    signal?: AbortSignal,
) {
    const url = new URL('api/wifi/points', base);
    url.searchParams.set('min-x', minX.toString());
    url.searchParams.set('min-y', minY.toString());
    url.searchParams.set('max-x', maxX.toString());
    url.searchParams.set('max-y', maxY.toString());
    const response = await http(url, { signal });
    assert(response.status === 200);
    const json = await response.json();
    return parse(HexagonAccessPointAggregation, json, { abortEarly: true });
}

export async function fetchCellScore(
    http: typeof fetch,
    base: URL,
    longitude: number,
    latitude: number,
    signal?: AbortSignal,
) {
    const url = new URL('api/score', base);
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('lat', latitude.toString());

    const response = await http(url, { signal });
    assert(response.status === 200);

    const json = await response.text();
    const score = Number(json);
    assert(Number.isFinite(score));
    return score;
}
