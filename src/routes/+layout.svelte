<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import NavBar from './NavBar.svelte';
    import logo from '$lib/logo/hotspotter.svg?raw';
    initializeStores();
</script>

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
