import { type Output, array, boolean, object, parse } from 'valibot';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { AccessPoint } from '$lib/models/wifi';
import { assert } from '$lib/assert';

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
    let networks = null as AccessPoints | null;
    const handle = await addScanListener(aps => {
        networks = aps;
    });
    await handle.remove();
    assert(networks !== null);
    return networks;
}
