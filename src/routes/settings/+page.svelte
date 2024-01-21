<script lang="ts">
    import { Avatar, ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { setScanInterval, setUrl } from '$lib/plugins/Config';
    import Error from '$lib/alerts/Error.svelte';
    import { PUBLIC_GOOGLE_WEB_CLIENT_ID } from '$lib/env';
    import { assert } from '$lib/assert';
    import { invalidateAll } from '$app/navigation';
    import { signIn } from '$lib/plugins/Credential';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ result } = data);

    const toast = getToastStore();
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
{#await signIn(PUBLIC_GOOGLE_WEB_CLIENT_ID)}
    <ProgressBar />
{:then { name, email, picture }}
    <a href="mailto:{email}" class="card flex items-center gap-2 p-4">
        <Avatar width="w-8" src={picture} />
        <span>{name}</span>
    </a>
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
