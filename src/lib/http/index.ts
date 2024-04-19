import {
    BatchOperationError,
    EmptyAuthorizationError,
    MalformedAuthorizationError,
    UnexpectedStatusCodeError,
} from './error';
import { type CellType, type Data, HexagonAccessPointCount, LeaderboardUsers } from '$lib/models/api';
import { PUBLIC_HOTSPOTTER_URL } from '$lib/env';
import { parse as jsonParse } from 'devalue';
import { parse as valiParse } from 'valibot';

/** @deprecated {@linkcode uploadReadings} */
export async function uploadReading(jwt: string, data: Data) {
    const url = new URL('api/reading', PUBLIC_HOTSPOTTER_URL);
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
            // TODO: The new endpoint now returns a float.
            return await response.text();
        case 400:
            throw new MalformedAuthorizationError();
        case 401:
            throw new EmptyAuthorizationError();
        default:
            throw new UnexpectedStatusCodeError(response.status);
    }
}

export async function uploadReadings(jwt: string, data: Data[]) {
    const url = new URL('api/readings', PUBLIC_HOTSPOTTER_URL);
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
            return parseFloat(await response.text());
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

export async function fetchHexagons(
    cellType: CellType,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    age: number | null,
    signal?: AbortSignal,
) {
    const url = new URL(`api/${cellType}/points`, PUBLIC_HOTSPOTTER_URL);
    if (age !== null) url.searchParams.set('age', age.toString());
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
    return valiParse(HexagonAccessPointCount, json, { abortEarly: true });
}

export async function fetchLeaderboard(http: typeof fetch, signal?: AbortSignal) {
    const url = new URL('api/leaderboard', PUBLIC_HOTSPOTTER_URL);
    const response = await http(url, { signal, mode: 'cors' });
    if (response.status !== 200) throw new UnexpectedStatusCodeError(response.status);
    const json = jsonParse(await response.text());
    return valiParse(LeaderboardUsers, json, { abortEarly: true });
}
