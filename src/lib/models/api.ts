import { CellSignalInfo, SignalStrength, Sim } from './cell.ts';
import { array, merge, minValue, number, object, safeInteger, string } from 'valibot';
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

const HexagonAccessPointCount = object({
    hex_id: string(),
    count: number([safeInteger(), minValue(0)]),
});

export const HexagonAccessPointAggregation = object({
    max: number([safeInteger(), minValue(0)]),
    hexes: array(HexagonAccessPointCount),
});
