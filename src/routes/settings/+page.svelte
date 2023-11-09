<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import Error from '$lib/alerts/Error.svelte';
    import { Preferences } from '@capacitor/preferences';
    import { assert } from '$lib/assert';

    const toast = getToastStore();

    async function submit(form: HTMLFormElement) {
        const data = new FormData(form);
        const value = data.get('url');
        assert(typeof value === 'string');
        await Preferences.set({ key: 'url', value });
        toast.trigger({
            message: 'New set API endpoint.',
            background: 'variant-filled-success',
            autohide: false,
        });
    }
</script>

{#await Preferences.get({ key: 'url' })}
    <ProgressBar />
{:then { value }}
    {@const placeholder = value ?? 'https://example.com/'}
    <form on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)}>
        <label>
            <span>URL</span>
            <input type="url" name="url" required {placeholder} class="input px-2 py-1" />
        </label>
    </form>
{:catch err}
    <Error>{err}</Error>
{/await}
