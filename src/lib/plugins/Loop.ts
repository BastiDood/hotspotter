import { type Plugin, registerPlugin } from '@capacitor/core';
import { parse, string } from 'valibot';
import { Data } from '$lib/models/api';
import { building } from '$app/environment';

export interface LoopPlugin extends Plugin {
    requestScan(): Promise<unknown>;
    startWatch(options: null, callback: (data: unknown) => void): Promise<unknown>;
    clearWatch(args: { id: string }): Promise<void>;
    startService(): Promise<void>;
    stopService(): Promise<void>;
}

const Loop = building ? null : registerPlugin<LoopPlugin>('LoopPlugin');

export async function startWatch(callback: (data: Data) => void) {
    if (Loop === null) return null;
    const id = await Loop.startWatch(null, data => callback(parse(Data, data, { abortEarly: true })));
    return parse(string(), id);
}

export async function clearWatch(id: Awaited<ReturnType<typeof startWatch>>) {
    if (Loop === null || id === null) return;
    await Loop.clearWatch({ id });
}

export async function startService() {
    await Loop?.startService();
}

export async function stopService() {
    await Loop?.stopService();
}
