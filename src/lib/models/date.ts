import { type Output, coerce, date, object } from 'valibot';

function coerceDate(value: unknown) {
    switch (typeof value) {
        case 'number':
        case 'string':
            return new Date(value);
        default:
            return value;
    }
}

const CoercedDate = coerce(date(), coerceDate);
export const DateRange = object({ start: CoercedDate, end: CoercedDate });
export type DateRange = Output<typeof DateRange>;
