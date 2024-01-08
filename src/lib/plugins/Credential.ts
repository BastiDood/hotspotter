import { type Plugin, registerPlugin } from '@capacitor/core';
import { Token } from '$lib/models/auth';
import { parse } from 'valibot';

interface CredentialPlugin extends Plugin {
    signIn(args: { id: string }): Promise<unknown>;
    signOut(): Promise<unknown>;
}

const Credential = registerPlugin<CredentialPlugin>('Credential');

/** @param id Client ID of the server. */
export async function signIn(id: string) {
    const result = await Credential.signIn({ id });
    return parse(Token, result, { abortEarly: true });
}

export async function signOut() {
    await Credential.signOut();
}
