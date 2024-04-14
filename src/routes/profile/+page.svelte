<script lang="ts">
    import { Avatar, ProgressBar } from '@skeletonlabs/skeleton';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import type { MaybePromise } from '@sveltejs/kit';
    import SignInButton from './SignInButton.svelte';
    import SignOutButton from './SignOutButton.svelte';
    import cookie from 'cookie';
    import { onMount } from 'svelte';
    import { verifyGoogleJwt } from '$lib/jwt';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ users } = data);

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

<div class="space-y-4 p-4">
    {#await profile}
        <ProgressBar />
    {:then result}
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
    {:catch err}
        <ErrorAlert>{err}</ErrorAlert>
    {/await}
    {#each users as { rank, name, picture, score }}
        <div class="card flex items-center gap-4 p-4 shadow">
            <div class="relative inline-block">
                <span class="variant-filled-secondary badge-icon absolute -right-0 -top-0 z-10">{rank}</span>
                <Avatar width="w-12" src={picture} />
            </div>
            <div class="flex flex-col">
                <span class="font-bold">{name}</span>
                <span class="text-surface-700-200-token text-xs">{score} Points</span>
            </div>
        </div>
    {/each}
</div>
