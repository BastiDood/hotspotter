import { ValiError, parse } from 'valibot';
import { AssertionError } from '$lib/assert';
import { DumpBatch } from '$lib/models/api';
import { dumpReadings } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';
import { verifyGoogleJwt } from '$lib/jwt';

export async function POST({ request }) {
    const auth = request.headers.get('Authorization');
    if (auth === null) error(401);

    const [bearer, jwt, ...rest] = auth.split(' ');
    if (bearer !== 'Bearer') error(400, `unexpected bearer [${bearer}]`);
    if (typeof jwt === 'undefined') error(400, 'empty JWT');
    if (rest.length > 0) error(400, `unexpected extra arguments ${rest}`);

    const user = await verifyGoogleJwt(jwt);
    const obj = await request.json();

    try {
        const json = parse(DumpBatch, obj);
        console.warn('dump id:', await dumpReadings(user, json));
        return new Response(null, { status: 201 });
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
