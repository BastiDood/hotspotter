<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import { Icon } from '@steeze-ui/svelte-icon';
    import NavBar from './NavBar.svelte';
    import { ChartBarSquare as src } from '@steeze-ui/heroicons';
    initializeStores();
</script>

<Toast />
<AppShell>
    <AppBar slot="header">
        <Icon {src} slot="lead" class="h-8" />
        <LightSwitch slot="trail" />
    </AppBar>
    <slot />
    <NavBar slot="footer" />
</AppShell>
