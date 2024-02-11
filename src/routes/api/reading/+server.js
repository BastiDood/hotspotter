import { Data } from '$lib/models/api';
import { assert } from '$lib/assert';
import { error } from '@sveltejs/kit';
import { parse } from 'valibot';
import { uploadReading } from '$lib/server/db';
import { verifyGoogleJwt } from '$lib/jwt';

export async function POST({ request }) {
    const auth = request.headers.get('Authorization');
    if (auth === null) error(401);

    const [bearer, jwt, ...rest] = auth.split(' ');
    assert(bearer === 'Bearer');
    assert(typeof jwt !== 'undefined');
    assert(rest.length === 0);

    const user = await verifyGoogleJwt(jwt);
    const json = await request.json();
    const input = parse(Data, json, { abortEarly: true });

    const reading = await uploadReading(user, input);
    return new Response(reading, { status: 201 });
}
