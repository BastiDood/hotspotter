import { Data } from '$lib/models/api';
import type { RequestHandler } from './$types';
import { parse } from 'valibot';
import { uploadReading } from '$lib/server/db';

// eslint-disable-next-line func-style
export const POST: RequestHandler = async ({ request }) => {
    const json = await request.json();
    const reading = await uploadReading(parse(Data, json, { abortEarly: true }));
    return new Response(reading, { status: 201 });
};
