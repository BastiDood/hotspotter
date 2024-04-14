import { fetchLeaderboard } from '$lib/server/db';
import { stringify } from 'devalue';

export async function GET() {
    const payload = stringify(await fetchLeaderboard());
    return new Response(payload, {
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length.toString(),
        },
    });
}
