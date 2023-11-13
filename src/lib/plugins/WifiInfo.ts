import { type Output, array, boolean, object, parse } from 'valibot';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { AccessPoint } from '$lib/models/wifi';
import { deferred } from '$lib/util';

interface WifiInfoPlugin extends Plugin {
    startScan(): Promise<unknown>;
    getScanResults(): Promise<unknown>;
}

const WifiInfo = registerPlugin<WifiInfoPlugin>('WifiInfo');

const StartScanResult = object({ ok: boolean() });
export async function startScan() {
    const output = await WifiInfo.startScan();
    return parse(StartScanResult, output).ok;
}

const AccessPointsResult = object({ results: array(AccessPoint) });
export async function getScanResults() {
    const output = await WifiInfo.getScanResults();
    return parse(AccessPointsResult, output).results;
}

type AccessPoints = Output<typeof AccessPoint>[];
type ScanCallback = (networks: AccessPoints) => void;
export function addScanListener(callback: ScanCallback) {
    return WifiInfo.addListener('scan', evt => callback(parse(AccessPointsResult, evt).results));
}

export async function performOneshotScan() {
    const { promise, resolve } = deferred<AccessPoints>();
    const handle = await addScanListener(resolve);
    try {
        const ok = await startScan();
        return ok ? await promise : await getScanResults();
    } finally {
        await handle.remove();
    }
}
