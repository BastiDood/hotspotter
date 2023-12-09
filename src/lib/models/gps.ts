import { coerce, date, nullable, number, object } from 'valibot';

export const Location = object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: coerce(date(), val => new Date(val as any)),
    latitude: number(),
    longitude: number(),
    coords_accuracy: number(),
    altitude: nullable(number()),
    altitude_accuracy: nullable(number()),
    speed: nullable(number()),
    heading: nullable(number()),
});
