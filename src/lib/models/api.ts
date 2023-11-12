import { SignalStrength, Sim } from '$lib/models/cell';
import { array, object } from 'valibot';
import { AccessPoint } from '$lib/models/wifi';

export const Data = object({
    wifi: array(AccessPoint),
    sim: Sim,
    strength: SignalStrength,
});
