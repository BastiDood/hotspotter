<script lang="ts">
    import type { PageData } from './$types';
    import { Preferences } from '@capacitor/preferences';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ url } = data);

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

<form on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)}>
    <label>
        <span>URL</span>
        <input type="url" name="url" required placeholder={url} class="input px-2 py-1" />
    </label>
</form>
