import { type Plugin, registerPlugin } from '@capacitor/core';
import { boolean, object, parse } from 'valibot';
import { building } from '$app/environment';

interface WifiInfoPlugin extends Plugin {
    startScan(): Promise<unknown>;
}

const WifiInfo = building ? null : registerPlugin<WifiInfoPlugin>('WifiInfo');

const StartScanResult = object({ ok: boolean() });
export async function startScan() {
    if (WifiInfo === null) return false;
    const output = await WifiInfo.startScan();
    return parse(StartScanResult, output).ok;
}
