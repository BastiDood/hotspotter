<script lang="ts">
    import type { PageData } from './$types';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { setUrl } from '$lib/plugins/Config';

    // eslint-disable-next-line init-declarations
    export let data: PageData;
    $: ({ url } = data);
    $: placeholder = url?.toString() ?? 'https://example.com/';

    const toast = getToastStore();
    async function submit(form: HTMLFormElement) {
        const data = new FormData(form);
        const url = data.get('url');
        assert(typeof url === 'string');
        await setUrl(url);
        toast.trigger({
            message: 'New set API endpoint.',
            background: 'variant-filled-success',
            autohide: false,
        });
    }
</script>

<form on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)}>
    <label>
        <span>API Endpoint</span>
        <input type="url" name="url" required {placeholder} class="input px-2 py-1" />
    </label>
</form>
