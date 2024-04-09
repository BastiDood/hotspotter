import { Meta } from '$lib/models/meta';
import { parse } from 'valibot';

export async function load({ fetch }) {
    const response = await fetch('/meta');
    const json = await response.json();
    return parse(Meta, json, { abortEarly: true });
}
