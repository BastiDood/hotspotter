import { type PermissionState, type Plugin, registerPlugin } from '@capacitor/core';
import { boolean, endsWith, nullable, object, parse, string } from 'valibot';
import { building } from '$app/environment';

export interface LoopPlugin extends Plugin {
    startWatch(options: null, callback: (data: unknown) => void): Promise<unknown>;
    clearWatch(args: { id: string }): Promise<void>;
    checkPermissions(): Promise<Record<string, PermissionState> | undefined>;
    requestPermissions<K extends string[]>(args: {
        permissions: K;
    }): Promise<Partial<Record<K[number], PermissionState>> | undefined>;
    bootService(): Promise<unknown>;
}

const Loop = building ? null : registerPlugin<LoopPlugin>('LoopPlugin');

const NullableData = nullable(object({ name: string([endsWith('.json')]) }));
export async function startWatch(callback: (date: string) => void) {
    if (Loop === null) return null;
    const id = await Loop.startWatch(null, data => {
        const payload = parse(NullableData, data);
        if (payload === null) return;
        callback(payload.name);
    });
    return parse(string(), id);
}

export async function clearWatch(id: string) {
    if (Loop === null) return;
    await Loop.clearWatch({ id });
}

export async function checkPermissions() {
    const result = await Loop?.checkPermissions();
    return result ?? ({} as Record<string, PermissionState>);
}

export async function requestPermissions<K extends string[]>(...permissions: K) {
    const result = await Loop?.requestPermissions({ permissions });
    return result ?? ({} as NonNullable<typeof result>);
}

const BootResult = object({ bound: boolean() });
export async function bootService() {
    if (Loop === null) return false;
    const result = await Loop.bootService();
    return parse(BootResult, result).bound;
}
