import { array, parse } from 'valibot';
import { Network } from '$lib/models/wifi';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';

export async function scan() {
    const networks = await WifiWizard2.scan();
    return parse(array(Network), networks);
}
