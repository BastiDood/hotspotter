import { ValiError, array, parse } from 'valibot';
import { Data } from '$lib/models/api';
import { error } from '@sveltejs/kit';
import pg from 'postgres';
import { uploadReadings } from '$lib/server/db';
import { verifyGoogleJwt } from '$lib/jwt';

export async function POST({ request }) {
    const auth = request.headers.get('Authorization');
    if (auth === null) error(401);

    const [bearer, jwt, ...rest] = auth.split(' ');
    if (bearer !== 'Bearer') error(400, `unexpected bearer [${bearer}]`);
    if (typeof jwt === 'undefined') error(400, 'empty JWT');
    if (rest.length > 0) error(400, `unexpected extra arguments ${rest}`);

    const user = await verifyGoogleJwt(jwt);
    const obj = await request.json();
    const input = parse(array(Data), obj, { abortEarly: true });

    try {
        const score = await uploadReadings(user, input);
        return new Response(score.toString(), { status: 201 });
    } catch (err) {
        if (err instanceof pg.PostgresError) {
            console.error(`[PG-${err.code}]: ${err.message}`);
            error(550, err);
        } else if (err instanceof ValiError) {
            for (const { reason, context, received, path } of err.issues) {
                const trace =
                    path
                        ?.map(path => {
                            switch (path.type) {
                                case 'object':
                                    return path.key;
                                case 'array':
                                case 'tuple':
                                case 'set':
                                case 'record':
                                    return path.key.toString();
                                case 'map':
                                case 'unknown':
                                default:
                                    return path.key instanceof Object ? path.key.toString() : '<?>';
                            }
                        })
                        .join('.') || '<?>';
                console.error(`received ${received} in ${trace} for ${context}@${reason}`);
            }
            error(551, err);
        }
        throw err;
    }
}
