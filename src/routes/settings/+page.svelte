<script lang="ts">
    import { setScanInterval, setUrl } from '$lib/plugins/Config';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { invalidateAll } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ scanInterval, url } = data);

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

<form on:submit|self|preventDefault|stopPropagation={({ currentTarget }) => submit(currentTarget)} class="space-y-4">
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
</form>
