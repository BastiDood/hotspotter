import { type Output, array, boolean, object, parse } from 'valibot';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { AccessPoint } from '$lib/models/wifi';
import { deferred } from '$lib/util';

interface WifiInfoPlugin extends Plugin {
    startScan(): Promise<unknown>;
}

const AccessPointsResult = object({ results: array(AccessPoint) });
const WifiInfo = registerPlugin<WifiInfoPlugin>('WifiInfo');

const StartScanResult = object({ result: boolean() });
export async function startScan() {
    const output = await WifiInfo.startScan();
    const { result } = parse(StartScanResult, output);
    return result;
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
        return (await startScan()) ? await promise : null;
    } finally {
        await handle.remove();
    }
}
