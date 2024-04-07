<script lang="ts">
    import { ArrowRightEndOnRectangle, ArrowRightStartOnRectangle } from '@steeze-ui/heroicons';
    import { Avatar, ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { CapacitorCookies } from '@capacitor/core';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import type { MaybePromise } from '@sveltejs/kit';
    import { PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
    import cookie from 'cookie';
    import { onMount } from 'svelte';
    import { signIn } from '$lib/plugins/Credential';
    import { verifyGoogleJwt } from '$lib/jwt';

    async function loadProfile() {
        const jwt = cookie.parse(document.cookie)['id'];
        if (typeof jwt === 'undefined') return null;
        const { name, email, picture } = await verifyGoogleJwt(jwt);
        return { name, email, picture };
    }

    type Profile = Awaited<ReturnType<typeof loadProfile>>;
    let profile = null as MaybePromise<Profile | null>;
    onMount(() => (profile = loadProfile()));

    const toast = getToastStore();

    async function signInWithGoogle(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const result = await signIn(PUBLIC_GOOGLE_WEB_CLIENT_ID);
            const { exp } = await verifyGoogleJwt(result.id);
            await CapacitorCookies.setCookie({
                path: '/',
                key: 'id',
                value: result.id,
                expires: exp.toUTCString(),
            });
            profile = result;
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

    async function logOut(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await CapacitorCookies.deleteCookie({ key: 'id' });
            toast.trigger({
                message: 'Successfully logged out.',
                background: 'variant-filled-success',
            });
            profile = null;
        } finally {
            button.disabled = false;
        }
    }
</script>

<!-- TODO: Use proper sign-in flow. -->
{#await profile}
    <ProgressBar />
{:then result}
    <div class="p-4">
        {#if result === null}
            <button
                type="button"
                class="variant-filled-tertiary btn"
                on:click={({ currentTarget }) => signInWithGoogle(currentTarget)}
            >
                <Icon src={ArrowRightEndOnRectangle} class="h-6" />
                <span>Sign in with Google</span>
            </button>
        {:else}
            {@const { name, email, picture } = result}
            <div class="card grid grid-cols-[auto_1fr_auto] items-center gap-2 p-4">
                <Avatar width="w-8" src={picture} />
                <a href="mailto:{email}" class="anchor">{name}</a>
                <button
                    type="button"
                    class="variant-filled-tertiary btn-icon btn-icon-sm p-1"
                    on:click={({ currentTarget }) => logOut(currentTarget)}
                >
                    <Icon src={ArrowRightStartOnRectangle} theme="micro" />
                </button>
            </div>
        {/if}
    </div>
{:catch err}
    <div class="p-4">
        <ErrorAlert>{err}</ErrorAlert>
    </div>
{/await}
