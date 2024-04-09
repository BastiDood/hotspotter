import {
    BatchOperationError,
    EmptyAuthorizationError,
    MalformedAuthorizationError,
    UnexpectedStatusCodeError,
} from './error';
import { type CellType, type Data, DataPoints, HexagonAccessPointCount } from '$lib/models/api';
import { array, parse, string, uuid } from 'valibot';
import { PUBLIC_HOTSPOTTER_URL } from '$lib/env';
import { assert } from '$lib/assert';

/** @deprecated {@linkcode uploadReadings} */
export async function uploadReading(jwt: string, data: Data) {
    const url = new URL('api/reading/', PUBLIC_HOTSPOTTER_URL);
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    switch (response.status) {
        case 201:
            return await response.text();
        case 400:
            throw new MalformedAuthorizationError();
        case 401:
            throw new EmptyAuthorizationError();
        default:
            throw new UnexpectedStatusCodeError(response.status);
    }
}

const ReadingIds = array(string([uuid()]));
export async function uploadReadings(jwt: string, data: Data[]) {
    const url = new URL('api/readings/', PUBLIC_HOTSPOTTER_URL);
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    switch (response.status) {
        case 201:
            return parse(ReadingIds, await response.json(), { abortEarly: true });
        case 400:
            throw new MalformedAuthorizationError();
        case 401:
            throw new EmptyAuthorizationError();
        case 550:
            throw new BatchOperationError();
        default:
            throw new UnexpectedStatusCodeError(response.status);
    }
}

export const enum MarkerMode {
    Cdma = 'cdma',
    Gsm = 'gsm',
    Lte = 'lte',
    Nr = 'nr',
    Tdscdma = 'tdscdma',
    Wcdma = 'wcdma',
}

export async function fetchMarkers(mode: MarkerMode) {
    const response = await fetch(new URL(`api/level/${mode}/`, PUBLIC_HOTSPOTTER_URL));
    if (response.status !== 200) throw new UnexpectedStatusCodeError(response.status);
    const json = await response.json();
    return parse(DataPoints, json, { abortEarly: true });
}

export async function fetchHexagons(
    cellType: CellType,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    signal?: AbortSignal,
) {
    const url = new URL(`api/${cellType}/points/`, PUBLIC_HOTSPOTTER_URL);
    url.searchParams.set('min-x', minX.toString());
    url.searchParams.set('min-y', minY.toString());
    url.searchParams.set('max-x', maxX.toString());
    url.searchParams.set('max-y', maxY.toString());
    const response = await fetch(url, { signal });
    switch (response.status) {
        case 200:
            break;
        case 400:
            throw new Error('malformed bounding box');
        default:
            throw new UnexpectedStatusCodeError(response.status);
    }
    const json = await response.json();
    return parse(HexagonAccessPointCount, json, { abortEarly: true });
}

export async function fetchCellScore(longitude: number, latitude: number, signal?: AbortSignal) {
    const url = new URL('api/score/', PUBLIC_HOTSPOTTER_URL);
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('lat', latitude.toString());
    const response = await fetch(url, { signal });
    switch (response.status) {
        case 200:
            break;
        case 400:
            throw new Error('malformed coordinates');
        default:
            throw new UnexpectedStatusCodeError(response.status);
    }
    const json = await response.text();
    const score = parseFloat(json);
    assert(isFinite(score), 'invalid score returned by server');
    return score;
}
