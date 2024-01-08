import { type Output, email, object, string, url } from 'valibot';

export const Token = object({
    id: string(),
    name: string(),
    email: string([email()]),
    picture: string([url()]),
});

export type Token = Output<typeof Token>;
