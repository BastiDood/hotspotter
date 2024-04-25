import { ValiError, array, parse } from 'valibot';
import { Data } from '$lib/models/api';
import { error } from '@sveltejs/kit';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';
import { uploadReadings } from '$lib/server/db';
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
    const input = parse(array(Data), obj);

    try {
        const score = await uploadReadings(user, input);
        return new Response(score.toString(), { status: 201 });
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
