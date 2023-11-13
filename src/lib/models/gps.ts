import { coerce, date, nullable, nullish, number, object } from 'valibot';

export const Location = object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: coerce(date(), val => new Date(val as any)),
    latitude: number(),
    longitude: number(),
    coordsAccuracy: number(),
    altitude: nullable(number()),
    altitudeAccuracy: nullish(number()),
    speed: nullable(number()),
    heading: nullable(number()),
});
