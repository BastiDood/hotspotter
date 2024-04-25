import { Data } from '$lib/models/api';
import { error } from '@sveltejs/kit';
import { parse } from 'valibot';
import { uploadReading } from '$lib/server/db';
import { verifyGoogleJwt } from '$lib/jwt';

export async function POST({ request }) {
    const auth = request.headers.get('Authorization');
    if (auth === null) error(401);

    const [bearer, jwt, ...rest] = auth.split(' ');

    if (bearer !== 'Bearer') error(400, `unexpected bearer [${bearer}]`);
    if (typeof jwt === 'undefined') error(400, 'empty JWT');
    if (rest.length > 0) error(400, `unexpected extra arguments ${rest}`);

    const user = await verifyGoogleJwt(jwt);
    const json = await request.json();
    const input = parse(Data, json);

    const reading = await uploadReading(user, input);
    return new Response(reading.toString(), { status: 201 });
}
