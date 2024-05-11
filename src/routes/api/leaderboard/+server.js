import { AssertionError } from '$lib/assert';
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
        console.error(err);
        if (err instanceof Error) {
            if (err instanceof pg.PostgresError) {
                console.error(`[PG-${err.code}]: ${err.message}`);
                error(550, err);
            }
            if (err instanceof ValiError) {
                for (const msg of printIssues(err.issues)) console.error(`[${err.name}]: ${msg}`);
                error(551, err);
            }
            if (err instanceof AssertionError) {
                console.error(`[${err.name}]: ${err.message}`);
                error(552, err);
            }
            error(500, err);
        }
        throw err;
    }
}
