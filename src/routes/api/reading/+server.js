import { Data } from '$lib/models/api';
import { error } from '@sveltejs/kit';
import { parse } from 'valibot';
import { uploadReading } from '$lib/server/db';
import { verifyGoogleJwt } from '$lib/jwt.js';

export async function POST({ cookies, request }) {
    const jwt = cookies.get('jwt');
    if (typeof jwt === 'undefined') error(401);
    const user = await verifyGoogleJwt(jwt);
    const json = await request.json();
    const input = parse(Data, json, { abortEarly: true });
    const reading = await uploadReading(user, input);
    return new Response(reading, { status: 201 });
}
