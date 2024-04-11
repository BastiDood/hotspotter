<script lang="ts">
    import { Avatar, ProgressBar } from '@skeletonlabs/skeleton';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import type { MaybePromise } from '@sveltejs/kit';
    import SignInButton from './SignInButton.svelte';
    import SignOutButton from './SignOutButton.svelte';
    import cookie from 'cookie';
    import { onMount } from 'svelte';
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
</script>

{#await profile}
    <ProgressBar />
{:then result}
    <div class="p-4">
        {#if result === null}
            <SignInButton on:token={({ detail }) => (profile = detail)} />
        {:else}
            {@const { name, email, picture } = result}
            <div class="card grid grid-cols-[auto_1fr_auto] items-center gap-2 p-4">
                <Avatar width="w-8" src={picture} />
                <a href="mailto:{email}" class="anchor">{name}</a>
                <SignOutButton on:out={() => (profile = null)} />
            </div>
        {/if}
    </div>
{:catch err}
    <div class="p-4">
        <ErrorAlert>{err}</ErrorAlert>
    </div>
{/await}
