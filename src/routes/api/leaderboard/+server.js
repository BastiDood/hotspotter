import { stringify } from 'devalue';
import { fetchLeaderboard } from '$lib/server/db';

export async function GET() {
    const readings = await fetchLeaderboard();
    return new Response(stringify(readings));
}
