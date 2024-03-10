import { computeCellScore } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function GET({ url: { searchParams } }) {
    const lon = searchParams.get('lon');
    if (lon === null) error(400, 'empty longitude');

    const longitude = parseFloat(lon);
    if (!isFinite(longitude)) error(400, 'invalid longitude');

    const lat = searchParams.get('lat');
    if (lat === null) error(400, 'empty latitude');

    const latitude = Number(longitude);
    if (!isFinite(latitude)) error(400, 'invalid latitude');

    const score = await computeCellScore(longitude, latitude);
    return new Response(score.toString());
}
