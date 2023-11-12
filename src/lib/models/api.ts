import { CellSignalStrength, SignalStrength, Sim } from '$lib/models/cell';
import { array, object, partial } from 'valibot';
import { AccessPoint } from '$lib/models/wifi';

export const Data = object({
    wifi: array(AccessPoint),
    sim: Sim,
    signal: SignalStrength,
    cell: partial(CellSignalStrength),
});
