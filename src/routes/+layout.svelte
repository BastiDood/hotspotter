<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
    import { ChartBarSquareIcon } from '@krowten/svelte-heroicons';
    import NavBar from './NavBar.svelte';
    initializeStores();
</script>

<Toast />
<AppShell>
    <AppBar slot="header">
        <ChartBarSquareIcon slot="lead" class="h-8" />
        <LightSwitch slot="trail" />
    </AppBar>
    <div class="m-4"><slot /></div>
    <NavBar slot="footer" />
</AppShell>
