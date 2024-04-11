<script lang="ts">
    import { ArrowRightEndOnRectangle } from '@steeze-ui/heroicons';
    import { CapacitorCookies } from '@capacitor/core';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
    import type { Token } from '$lib/models/auth';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { signIn } from '$lib/plugins/Credential';
    import { verifyGoogleJwt } from '$lib/jwt';

    const dispatch = createEventDispatcher<{ token: Token }>();
    const toast = getToastStore();
    async function signInWithGoogle(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const token = await signIn(PUBLIC_GOOGLE_WEB_CLIENT_ID);
            const { exp } = await verifyGoogleJwt(token.id);
            await CapacitorCookies.setCookie({
                path: '/',
                key: 'id',
                value: token.id,
                expires: exp.toUTCString(),
            });
            dispatch('token', token);
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: `${err.name}: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

<button
    type="button"
    class="variant-filled-tertiary btn w-full"
    on:click={({ currentTarget }) => signInWithGoogle(currentTarget)}
>
    <div class="grid grid-cols-[auto_1fr] gap-1">
        <Icon src={ArrowRightEndOnRectangle} class="h-6" />
        <span>Sign in with Google</span>
    </div>
</button>
