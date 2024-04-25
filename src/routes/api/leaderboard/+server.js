import { ValiError } from 'valibot';
import { error } from '@sveltejs/kit';
import { fetchLeaderboard } from '$lib/server/db';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';
import { stringify } from 'devalue';

export async function GET() {
    try {
        const payload = stringify(await fetchLeaderboard());
        return new Response(payload, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length.toString(),
            },
        });
    } catch (err) {
        if (err instanceof pg.PostgresError) {
            console.error(`[PG-${err.code}]: ${err.message}`);
            error(550, err);
        } else if (err instanceof ValiError) {
            printIssues(err.issues);
            error(551, err);
        }
        throw err;
    }
}
