<script lang="ts">
    import { ArrowRightEndOnRectangle, ArrowRightStartOnRectangle } from '@steeze-ui/heroicons';
    import { Avatar, ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { CapacitorCookies } from '@capacitor/core';
    import Error from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import type { MaybePromise } from '@sveltejs/kit';
    import { PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
    import { assert } from '$lib/assert';
    import cookie from 'cookie';
    import { invalidateAll } from '$app/navigation';
    import { setUrl } from '$lib/plugins/Config';
    import { signIn } from '$lib/plugins/Credential';
    import { verifyGoogleJwt } from '$lib/jwt';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ url } = data);

    const toast = getToastStore();

    async function loadProfile() {
        const jwt = cookie.parse(document.cookie).id;
        if (typeof jwt === 'undefined') return null;
        const { name, email, picture } = await verifyGoogleJwt(jwt);
        return { name, email, picture };
    }

    type Profile = Awaited<ReturnType<typeof loadProfile>>;
    $: profile = url === null ? null : (loadProfile() as MaybePromise<Profile | null>);

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

    async function submit(form: HTMLFormElement) {
        const data = new FormData(form);
        const url = data.get('url');
        if (url !== null) {
            assert(typeof url === 'string');
            await setUrl(url);
        }
        await invalidateAll();
        toast.trigger({
            message: 'Configuration saved!',
            background: 'variant-filled-success',
            autohide: false,
        });
    }
</script>

<!-- TODO: Use proper sign-in flow. -->
{#await profile}
    <ProgressBar />
{:then result}
    <div class="space-y-4 p-4">
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
        {#if url === null}
            <Error>No configuration detected.</Error>
        {:else}
            <form
                on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)}
                class="space-y-4"
            >
                <label class="space-y-2">
                    <span>Base URL for API</span>
                    <input
                        type="url"
                        name="url"
                        required
                        placeholder="https://example.com/api/"
                        value={url}
                        class="input px-2 py-1"
                    />
                </label>
                <button type="submit" class="variant-filled-primary btn">Save</button>
            </form>
        {/if}
    </div>
{:catch err}
    <div class="p-4">
        <Error>{err}</Error>
    </div>
{/await}
