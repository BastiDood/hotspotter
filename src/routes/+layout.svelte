<script>
    import './app.css';
    import * as Network from '$lib/controls/network';
    import * as Operator from '$lib/controls/operator';
    import * as Temporal from '$lib/controls/temporal';
    import { AppBar, AppShell, Drawer, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import { App } from '@capacitor/app';
    import DatePicker from '$lib/controls/temporal/DatePicker.svelte';
    import NavBar from './NavBar.svelte';
    import favicon from '$lib/logo/favicon.png?url';
    import logo from '$lib/logo/hotspotter.svg?raw';
    import { onMount } from 'svelte';

    initializeStores();
    Network.init();
    Operator.init();
    Temporal.initStart();
    Temporal.initEnd();

    const start = Temporal.getStart();
    const end = Temporal.getEnd();

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

<Drawer duration={300} width="w-3/4" regionDrawer="p-4 space-y-4">
    <h3 class="h3">Advanced Filters</h3>
    {#await Promise.resolve() then}
        <DatePicker bind:startDate={$start} bind:endDate={$end} />
    {/await}
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
