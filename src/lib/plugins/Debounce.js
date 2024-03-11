import { Preferences } from '@capacitor/preferences';
import { assert } from '$lib/assert';

/** @param {Date} timestamp */
export async function resetScanCount(timestamp) {
    await Preferences.set({ key: 'scan', value: `${timestamp.valueOf()},0` });
    return { timestamp, count: 0 };
}

/** @param {string} raw */
function parseScan(raw) {
    const [scanTimestamp, scanCount, ...rest] = raw.split(',');
    assert(rest.length === 0);
    assert(typeof scanCount !== 'undefined');
    assert(typeof scanTimestamp !== 'undefined');
    const count = parseInt(scanCount, 10);
    const timestamp = new Date(parseInt(scanTimestamp, 10));
    return { timestamp, count };
}

/** @param {string|null} raw */
async function resetIfExpired(raw) {
    const now = new Date();
    if (raw === null) return await resetScanCount(now);
    const result = parseScan(raw);
    const deadline = result.timestamp.valueOf() + 120_000;
    return now.valueOf() < deadline ? result : await resetScanCount(now);
}

export async function getLastScan() {
    const { value } = await Preferences.get({ key: 'scan' });
    return await resetIfExpired(value);
}

export async function incrementScanCount() {
    const { value } = await Preferences.get({ key: 'scan' });
    const { timestamp, count } = value === null ? { timestamp: new Date(), count: 0 } : parseScan(value);
    await Preferences.set({ key: 'scan', value: `${timestamp.valueOf()},${count + 1}` });
}
