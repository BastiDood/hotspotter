import { CellSignalInfo, Sim } from './cell';
import { type Output, array, coerce, date, merge, number, object, record } from 'valibot';
import { AccessPoint } from './wifi';
import { Location } from './gps';

export const enum CellType {
    WiFi = 'wifi',
    Gsm = 'gsm',
    Cdma = 'cdma',
    Lte = 'lte',
    Nr = 'nr',
    Tdscdma = 'tdscdma',
    Wcdma = 'wcdma',
}

export const Data = object({
    // @ts-expect-error We are coercing the input as a date.
    now: coerce(date(), input => new Date(input)),
    gps: Location,
    wifi: array(AccessPoint),
    sim: Sim,
});

export type Data = Output<typeof Data>;

const Circle = object({
    lon: number(),
    lat: number(),
    rad: number(),
});

export const DataPoints = array(merge([CellSignalInfo, Circle]));
export type DataPoints = Output<typeof DataPoints>;

export const HexagonAccessPointCount = record(number());
export type HexagonAccessPointCount = Output<typeof HexagonAccessPointCount>;
