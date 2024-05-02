<script>
    import './app.css';
    import { AppBar, AppShell, Drawer, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import { App } from '@capacitor/app';
    import DatePicker from './DatePicker.svelte';
    import NavBar from './NavBar.svelte';
    import favicon from '$lib/logo/favicon.png?url';
    import logo from '$lib/logo/hotspotter.svg?raw';
    import { onMount } from 'svelte';
    initializeStores();
    onMount(() => {
        const promise = App.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) history.back();
            else App.exitApp(); // NOTE: `Promise` intentionally ignored.
        });
        return async () => {
            const handle = await promise;
            await handle.remove();
        };
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<Drawer duration={300} width="w-3/4" regionDrawer="p-2 space-y-4">
    <h3 class="h3">Advanced Filters</h3>
    <DatePicker on:change={console.log} />
</Drawer>
<Toast />
<AppShell>
    <AppBar slot="header">
        <div slot="lead" class="fill-token size-6">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html logo}
        </div>
        <LightSwitch slot="trail" />
    </AppBar>
    <slot />
    <NavBar slot="footer" />
</AppShell>
