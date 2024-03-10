import { PUBLIC_GOOGLE_APP_CLIENT_ID, PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
import { boolean, email, number, object, parse, safeInteger, string, transform, url } from 'valibot';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { assert } from '$lib/assert';

const Claims = object({
    hd: string(),
    azp: string(),
    sub: string(),
    exp: transform(number([safeInteger()]), secs => new Date(secs * 1000)),
    name: string(),
    email: string([email()]),
    email_verified: boolean(),
    picture: string([url()]),
});

const RemoteJwkSet = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function verifyGoogleJwt(jwt: string) {
    const { payload } = await jwtVerify(jwt, RemoteJwkSet, {
        audience: PUBLIC_GOOGLE_WEB_CLIENT_ID,
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        requiredClaims: ['azp', 'sub'],
    });
    const { hd, azp, sub, exp, name, email, email_verified, picture } = parse(Claims, payload);
    assert(hd === 'up.edu.ph', 'non-UP email provided');
    assert(azp === PUBLIC_GOOGLE_APP_CLIENT_ID, 'authorized party mismatch');
    assert(email_verified, 'unverified email provided');
    return { sub, exp, name, email, picture };
}

export type User = Awaited<ReturnType<typeof verifyGoogleJwt>>;
