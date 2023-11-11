import type { Data } from '$lib/models/api';
import type { Output } from 'valibot';
import { assert } from './assert';

export async function submit(url: URL, data: Output<typeof Data>) {
    const { status } = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    assert(status === 201);
}
