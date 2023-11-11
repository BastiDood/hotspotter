import { CellSignalStrength, SignalStrength, Sim } from '$lib/models/cell';
import { array, object, partial } from 'valibot';
import { Network } from '$lib/models/wifi';

export const Data = object({
    wifi: array(Network),
    sim: Sim,
    signal: SignalStrength,
    cell: partial(CellSignalStrength),
});
