<script lang="ts">
    import ClearButton from './ClearButton.svelte';
    import DisplayData from './DisplayData.svelte';
    import SyncButton from './SyncButton.svelte';

    import ErrorAlert from '$lib/alerts/Error.svelte';
    import SuccessAlert from '$lib/alerts/Success.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';

    import { Icon } from '@steeze-ui/svelte-icon';
    import { ShieldCheck } from '@steeze-ui/heroicons';

    import { bootService, clearWatch, requestPermissions, startWatch } from '$lib/plugins/Loop';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';
    import { startScan } from '$lib/plugins/WifiInfo';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ cache, permissions } = data);
    $: files = Object.entries(cache).map(([now, value]) => ({ now: new Date(parseInt(now, 10)), ...value }));
    $: perms = Object.entries(permissions);

    let disabled = false;

    const toast = getToastStore();

    async function boot(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            const payload = (await bootService())
                ? { message: 'Loop service started.', background: 'variant-filled-success' }
                : { message: 'Loop service boot failed.', background: 'variant-filled-error' };
            toast.trigger(payload);
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            button.disabled = false;
        }
    }

    async function request(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            if (await startScan()) return;
            toast.trigger({
                message:
                    'Wi-Fi scanning failed. This may be due to permission errors, throttling, or disabled Wi-Fi radios.',
                background: 'variant-filled-error',
            });
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            button.disabled = false;
        }
    }

    async function prompt(button: HTMLButtonElement, perm: string) {
        button.disabled = true;
        try {
            const result = await requestPermissions(perm);
            const state = result[perm];
            if (typeof state === 'undefined') return;
            permissions[perm] = state;
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            button.disabled = false;
        }
    }

    async function watch() {
        try {
            return await startWatch(data => (files = [...files, data]));
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        }
    }

    onMount(() => {
        const id = watch();
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
                <span class="text-sm">Permission to access <b>{perm}</b> information was granted.</span>
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
                        {disabled}
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
    <button class="variant-filled-primary btn w-full" on:click={({ currentTarget }) => boot(currentTarget)}>Boot Service</button>
    <button class="variant-filled-primary btn w-full" on:click={({ currentTarget }) => request(currentTarget)}>Request Scan</button>
    <hr />
    <h3 class="h3">Cached Readings</h3>
    {#if files.length === 0}
        <SuccessAlert>All readings synchronized. &#x1F389;</SuccessAlert>
    {:else}
        <SyncButton bind:disabled />
        <ClearButton bind:disabled />
        <DisplayData {files} />
    {/if}
</div>
