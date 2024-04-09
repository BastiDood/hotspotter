import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { text } from 'stream/consumers';

export const prerender = true;

export async function GET() {
    const timestamp = new Date().toISOString();
    const raw = await text(spawn('git', ['rev-parse', 'HEAD']).stdout);
    return json({ timestamp, revision: raw.trim() });
}
