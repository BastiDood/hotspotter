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
    return parse(StartScanResult, output).ok;
}

const AccessPointsResult = object({ results: array(AccessPoint) });
export async function getScanResults() {
    if (WifiInfo === null) return [];
    const output = await WifiInfo.getScanResults();
    return parse(AccessPointsResult, output).results;
}

const AccessPoints = array(AccessPoint);
const AccessPointsResults = object({ results: array(AccessPoint) });
export async function startWatch(callback: (networks: AccessPoint[]) => void) {
    if (WifiInfo === null) return null;
    const id = await WifiInfo.startWatch(null, networks => {
        const { results } = parse(AccessPointsResults, networks);
        callback(results);
    });
    return parse(Id, id);
}

export async function clearWatch(id: Awaited<ReturnType<typeof startWatch>>) {
    if (WifiInfo === null || id === null) return;
    await WifiInfo.clearWatch({ id });
}

export async function performOneshotScan() {
    const { promise, resolve } = deferred<Output<typeof AccessPoints>>();
    const id = await startWatch(resolve);
    try {
        assert(await startScan(), 'WiFi scanning failed');
        const results = await promise;
        return results;
    } finally {
        await clearWatch(id);
    }
}
