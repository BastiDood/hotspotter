<script lang="ts">
    import { ChartBarIcon, Cog6ToothIcon, GlobeAltIcon, HomeIcon, MapIcon, WifiIcon } from '@krowten/svelte-heroicons';
    import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    $: ({ pathname } = $page.url);
</script>

<TabGroup
    justify="justify-center"
    active="variant-filled-primary"
    hover="hover:variant-soft-primary"
    flex="flex-1"
    padding="px-1 py-2"
    rounded=""
    class="bg-surface-100-800-token w-full text-xs"
>
    <TabAnchor href="/" selected={pathname === '/'}>
        <HomeIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Home</span>
    </TabAnchor>
    <TabAnchor href="/map" selected={pathname === '/map/'}>
        <MapIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Map</span>
    </TabAnchor>
    <TabAnchor href="/gps" selected={pathname === '/gps/'}>
        <GlobeAltIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>GPS</span>
    </TabAnchor>
    <TabAnchor href="/sim" selected={pathname === '/sim/'}>
        <ChartBarIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>SIM</span>
    </TabAnchor>
    <TabAnchor href="/wifi" selected={pathname === '/wifi/'}>
        <WifiIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>WiFi</span>
    </TabAnchor>
    <TabAnchor href="/settings" selected={pathname === '/settings/'}>
        <Cog6ToothIcon slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Settings</span>
    </TabAnchor>
</TabGroup>
