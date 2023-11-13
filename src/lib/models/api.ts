import { SignalStrength, Sim } from '$lib/models/cell';
import { array, object } from 'valibot';
import { AccessPoint } from '$lib/models/wifi';
import { Location } from './gps';

export const Data = object({
    gps: Location,
    wifi: array(AccessPoint),
    sim: Sim,
    strength: SignalStrength,
});
