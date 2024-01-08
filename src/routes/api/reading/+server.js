import { Data } from '$lib/models/api';
import { parse } from 'valibot';
import { uploadReading } from '$lib/server/db';

export async function POST({ request }) {
    const json = await request.json();
    const reading = await uploadReading(parse(Data, json, { abortEarly: true }));
    return new Response(reading, { status: 201 });
}
