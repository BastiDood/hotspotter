<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import DisplayData from './DisplayData.svelte';
    import ScanButton from './ScanButton.svelte';
    import UploadButton from './UploadButton.svelte';

    import ErrorAlert from '$lib/alerts/Error.svelte';
    import SuccessAlert from '$lib/alerts/Success.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';

    import { Icon } from '@steeze-ui/svelte-icon';
    import { ShieldCheck } from '@steeze-ui/heroicons';

    import { bootService, clearWatch, requestPermissions, startWatch } from '$lib/plugins/Loop';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ cache, permissions } = data);
    $: files = Object.entries(cache).map(([now, value]) => ({ now: new Date(parseInt(now, 10)), ...value }));
    $: perms = Object.entries(permissions);

    let disabled = false;

    const toast = getToastStore();

    async function boot() {
        if (Object.values(permissions).every(state => state === 'granted')) {
            if (await bootService()) console.log('Loop service booted.');
            else console.error('Loop service boot failed.');
        }
    }

    async function prompt(button: HTMLButtonElement, perm: string) {
        button.disabled = true;
        try {
            const result = await requestPermissions(perm);
            const state = result[perm];
            if (typeof state === 'undefined') return;
            permissions[perm] = state;
            await boot();
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                toast.trigger({
                    message: `[${err.name}]: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return;
            }
            throw err;
        } finally {
            button.disabled = false;
        }
    }

    async function watch() {
        try {
            return await startWatch(data => (files = [...files, data]));
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                toast.trigger({
                    message: `[${err.name}]: ${err.message}`,
                    background: 'variant-filled-error',
                    autohide: false,
                });
                return null;
            }
            throw err;
        }
    }

    async function mount() {
        const id = await watch();
        await boot();
        return id;
    }

    onMount(() => {
        const id = mount();
        return async () => {
            const handle = await id;
            if (handle === null) return;
            await clearWatch(handle);
        };
    });
</script>

<div class="space-y-4 p-4">
    {#each perms as [perm, state] (perm)}
        {#if state === 'granted'}
            <SuccessAlert>
                <span class="text-sm">Permission for <b>{perm}</b> granted.</span>
            </SuccessAlert>
        {:else if state === 'denied'}
            <ErrorAlert>
                <span class="text-sm"
                    >Permission to access <b>{perm}</b> information was explicitly denied. To grant this permission, go to
                    the system settings.</span
                >
            </ErrorAlert>
        {:else}
            <WarningAlert>
                <div class="grid w-full grid-cols-[1fr_auto] items-center">
                    <span class="text-sm">Permission to access <b>{perm}</b> information may be granted.</span>
                    <button
                        type="button"
                        class="variant-glass-success btn-icon p-1 shadow"
                        on:click={({ currentTarget }) => prompt(currentTarget, perm)}><Icon src={ShieldCheck} /></button
                    >
                </div>
            </WarningAlert>
        {/if}
    {:else}
        <ErrorAlert>
            <span class="text-sm">The loop service is unavailable in the web version.</span>
        </ErrorAlert>
    {/each}
    <hr />
    <h3 class="h3">Cached Readings</h3>
    {#if files.length === 0}
        <SuccessAlert>All readings synchronized. &#x1F389;</SuccessAlert>
    {:else}
        <div class="grid grid-cols-3 gap-2">
            <ScanButton bind:disabled />
            <UploadButton bind:disabled />
            <ClearButton bind:disabled />
        </div>
        <DisplayData {files} />
    {/if}
</div>
