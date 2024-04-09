import { type Output, isoTimestamp, object, string } from 'valibot';

export const Meta = object({
    revision: string(),
    timestamp: string([isoTimestamp()]),
});

export type Meta = Output<typeof Meta>;
