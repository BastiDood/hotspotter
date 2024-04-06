import { type Output, array, boolean, object, parse, string } from 'valibot';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { AccessPoint } from '$lib/models/wifi';
import { assert } from '$lib/assert';
import { building } from '$app/environment';
import { deferred } from '$lib/util';

const Id = string();
type Id = Output<typeof Id>;

interface WifiInfoPlugin extends Plugin {
    startScan(): Promise<unknown>;
    getScanResults(): Promise<unknown>;
    startWatch(options: null, callback: (networks: unknown) => void): Promise<unknown>;
    clearWatch(args: { id: Id }): Promise<void>;
}

const WifiInfo = building ? null : registerPlugin<WifiInfoPlugin>('WifiInfo');

const StartScanResult = object({ ok: boolean() });
export async function startScan() {
    if (WifiInfo === null) return false;
    const output = await WifiInfo.startScan();
    return parse(StartScanResult, output, { abortEarly: true }).ok;
}

const AccessPointsResult = object({ results: array(AccessPoint) });
export async function getScanResults() {
    if (WifiInfo === null) return [];
    const output = await WifiInfo.getScanResults();
    return parse(AccessPointsResult, output, { abortEarly: true }).results;
}

const AccessPoints = array(AccessPoint);
type AccessPoints = Output<typeof AccessPoints>;

const AccessPointsResults = object({ results: array(AccessPoint) });
export async function startWatch(callback: (networks: AccessPoints) => void) {
    if (WifiInfo === null) return null;
    const id = await WifiInfo.startWatch(null, networks => {
        const { results } = parse(AccessPointsResults, networks, { abortEarly: true });
        callback(results);
    });
    return parse(Id, id);
}

export async function clearWatch(id: Awaited<ReturnType<typeof startWatch>>) {
    if (WifiInfo === null || id === null) return;
    await WifiInfo.clearWatch({ id });
}

export async function performOneshotScan() {
    const { promise, resolve } = deferred<AccessPoints>();
    const id = await startWatch(resolve);
    try {
        assert(
            await startScan(),
            'Wi-Fi scanning failed. This may be due to permission errors, throttling, or disabled Wi-Fi radios.',
        );
        return await promise;
    } finally {
        await clearWatch(id);
    }
}
