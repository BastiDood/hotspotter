<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import { ChartBarSquare } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import NavBar from './NavBar.svelte';
    initializeStores();
</script>

<Toast />
<AppShell>
    <AppBar slot="header">
        <Icon src={ChartBarSquare} slot="lead" class="h-8" />
        <LightSwitch slot="trail" />
    </AppBar>
    <slot />
    <NavBar slot="footer" />
</AppShell>
