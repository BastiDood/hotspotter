import { ValiError, array, parse } from 'valibot';
import { dumpReadings, uploadReadings } from '$lib/server/db';
import { AssertionError } from '$lib/assert';
import { Data } from '$lib/models/api';
import { error } from '@sveltejs/kit';
import pg from 'postgres';
import { printIssues } from '$lib/error/valibot';
import { verifyGoogleJwt } from '$lib/jwt';

const DataBatch = array(Data);

/**
 * @param {unknown} obj
 * @returns {obj is object}
 */
function isNonNullObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

/** @param {unknown} data */
function transformDump(data) {
    if (Array.isArray(data) && data.every(isNonNullObject)) return data;
    if (isNonNullObject(data)) return [data];
    return [];
}

export async function POST({ request }) {
    const auth = request.headers.get('Authorization');
    if (auth === null) error(401);

    const [bearer, jwt, ...rest] = auth.split(' ');
    if (bearer !== 'Bearer') error(400, `unexpected bearer [${bearer}]`);
    if (typeof jwt === 'undefined') error(400, 'empty JWT');
    if (rest.length > 0) error(400, `unexpected extra arguments ${rest}`);

    const user = await verifyGoogleJwt(jwt);
    const obj = await request.json();

    try {
        const input = parse(DataBatch, obj);
        const score = await uploadReadings(user, input);
        return new Response(score.toString(), { status: 201 });
    } catch (err) {
        try {
            console.error(err);
            if (err instanceof Error) {
                if (err instanceof pg.PostgresError) {
                    console.error(`[PG-${err.code}]: ${err.message}`);
                    error(550, err);
                }
                if (err instanceof ValiError) {
                    for (const msg of printIssues(err.issues)) console.error(`[${err.name}]: ${msg}`);
                    error(551, err);
                }
                if (err instanceof AssertionError) {
                    console.error(`[${err.name}]: ${err.message}`);
                    error(552, err);
                }
                error(500, err);
            }
            throw err;
        } finally {
            const readings = transformDump(obj);
            if (readings.length === 0) console.error('bad reading:', JSON.stringify(obj));
            else console.warn('dump ids:', await dumpReadings(user, readings));
        }
    }
}
