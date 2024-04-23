<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import NavBar from './NavBar.svelte';
    import favicon from '$lib/logo/favicon.png?url';
    import logo from '$lib/logo/hotspotter.svg?raw';
    initializeStores();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

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
