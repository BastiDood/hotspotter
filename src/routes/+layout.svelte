<script>
    import './app.css';
    import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
    import NavBar from './NavBar.svelte';
</script>

<AppShell>
    <AppBar slot="header">
        <span slot="lead">CS 198</span>
        <LightSwitch slot="trail" />
    </AppBar>
    <slot />
    <NavBar slot="footer" />
</AppShell>
