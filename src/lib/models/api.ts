import { CellSignalInfo, SignalStrength, Sim } from './cell';
import { type Output, array, merge, minValue, number, object, safeInteger, string } from 'valibot';
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

const HexagonAccessPointCount = object({
    hex_id: string(),
    count: number([safeInteger(), minValue(0)]),
});

export const HexagonAccessPointAggregation = object({
    max: number([safeInteger(), minValue(0)]),
    hexes: array(HexagonAccessPointCount),
});

export type HexagonAccessPointAggregation = Output<typeof HexagonAccessPointAggregation>;
