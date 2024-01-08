import { computeCellScore } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function GET({ url: { searchParams } }) {
    const lon = searchParams.get('lon');
    if (lon === null) error(400);

    const longitude = Number(lon);
    if (!Number.isFinite(longitude)) error(400);

    const lat = searchParams.get('lat');
    if (lat === null) error(400);

    const latitude = Number(longitude);
    if (!Number.isFinite(latitude)) error(400);

    const score = await computeCellScore(longitude, latitude);
    return new Response(score.toString());
}
