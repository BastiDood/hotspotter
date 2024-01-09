import { CellSignalInfo, SignalStrength, Sim } from './cell';
import { type Output, array, merge, number, object, record, safeInteger } from 'valibot';
import { AccessPoint } from './wifi';
import { Location } from './gps';

export const Data = object({
    gps: Location,
    wifi: array(AccessPoint),
    sim: Sim,
    strength: SignalStrength,
});

export type Data = Output<typeof Data>;

const Circle = object({
    lon: number(),
    lat: number(),
    rad: number(),
});

export const DataPoints = array(merge([CellSignalInfo, Circle]));
export type DataPoints = Output<typeof DataPoints>;

export const HexagonAccessPointCount = record(number([safeInteger()]));
export type HexagonAccessPointCount = Output<typeof HexagonAccessPointCount>;
