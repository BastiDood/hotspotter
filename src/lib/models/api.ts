import { CellSignalInfo, SignalStrength, Sim } from './cell.ts';
import { array, merge, number, object } from 'valibot';
import { AccessPoint } from './wifi.ts';
import { Location } from './gps.ts';

export const Data = object({
    gps: Location,
    wifi: array(AccessPoint),
    sim: Sim,
    strength: SignalStrength,
});

const Circle = object({
    lon: number(),
    lat: number(),
    rad: number(),
});

export const DataPoints = array(merge([CellSignalInfo, Circle]));
