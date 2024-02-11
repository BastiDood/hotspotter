<script lang="ts">
    import { Avatar, ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { setScanInterval, setUrl } from '$lib/plugins/Config';
    import { ArrowRightStartOnRectangle } from '@steeze-ui/heroicons';
    import { CapacitorCookies } from '@capacitor/core';
    import Error from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
    import { assert } from '$lib/assert';
    import cookie from 'cookie';
    import { invalidateAll } from '$app/navigation';
    import { signIn } from '$lib/plugins/Credential';
    import { verifyGoogleJwt } from '$lib/jwt';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ result } = data);

    const toast = getToastStore();

    async function signInWithGoogle() {
        const profile = await signIn(PUBLIC_GOOGLE_WEB_CLIENT_ID);
        const { exp } = await verifyGoogleJwt(profile.id);
        await CapacitorCookies.setCookie({
            path: '/',
            key: 'id',
            value: profile.id,
            expires: exp.toUTCString(),
        });
        return profile;
    }

    async function getProfile() {
        const jwt = cookie.parse(document.cookie).id;
        const promise = typeof jwt === 'undefined' ? signInWithGoogle() : verifyGoogleJwt(jwt);
        const { name, email, picture } = await promise;
        return { name, email, picture };
    }

    async function logOut(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await CapacitorCookies.deleteCookie({ key: 'id' });
            toast.trigger({
                message: 'Successfully logged out.',
                background: 'variant-filled-success',
            });
        } finally {
            button.disabled = false;
        }
    }

    async function submit(form: HTMLFormElement) {
        const data = new FormData(form);

        const url = data.get('url');
        if (url) {
            assert(typeof url === 'string');
            await setUrl(url);
        }

        const scanInterval = data.get('scan-interval');
        if (scanInterval) {
            assert(typeof scanInterval === 'string');
            await setScanInterval(parseInt(scanInterval, 10));
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
{#await getProfile()}
    <ProgressBar />
{:then { name, email, picture }}
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
{:catch err}
    <Error>{err}</Error>
{/await}
<form on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)} class="space-y-4">
    {#if result !== null}
        {@const { url, scanInterval } = result}
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
        <label class="space-y-2">
            <span>Scan Interval</span>
            <input
                type="number"
                name="scan-interval"
                required
                min="0"
                placeholder="Milliseconds"
                value={scanInterval}
                class="input px-2 py-1"
            />
        </label>
        <button type="submit" class="variant-filled-primary btn">Save</button>
    {/if}
</form>
