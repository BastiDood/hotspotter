import { error, json } from '@sveltejs/kit';
import { aggregateAccessPoints } from '$lib/server/db';

function extractNumberFromQuery(params: URLSearchParams, query: string) {
    const value = params.get(query);
    if (value === null) return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

export async function GET({ url: { searchParams } }) {
    const extract = extractNumberFromQuery.bind(null, searchParams);

    const minX = extract('min-x');
    if (minX === null) throw error(400);

    const minY = extract('min-y');
    if (minY === null) throw error(400);

    const maxX = extract('max-x');
    if (maxX === null) throw error(400);

    const maxY = extract('max-y');
    if (maxY === null) throw error(400);

    const result = await aggregateAccessPoints(minX, minY, maxX, maxY);
    if (result === null) return new Response(null, { status: 404 });
    return json(result);
}
