<script lang="ts">
    import { GlobeAltIcon, MapIcon, WifiIcon } from '@krowten/svelte-heroicons';
    import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    $: ({ pathname } = $page.url);
</script>

<TabGroup
    justify="justify-center"
    active="variant-filled-primary"
    hover="hover:variant-soft-primary"
    flex="flex-1"
    rounded=""
    class="bg-surface-100-800-token w-full"
>
    <TabAnchor href="/gps" selected={pathname === '/gps/'}>
        <GlobeAltIcon slot="lead" class="m-auto h-8" />
        <span>GPS</span>
    </TabAnchor>
    <TabAnchor href="/" selected={pathname === '/'}>
        <MapIcon slot="lead" class="m-auto h-8" />
        <span>Map</span>
    </TabAnchor>
    <TabAnchor href="/wifi" selected={pathname === '/wifi/'}>
        <WifiIcon slot="lead" class="m-auto h-8" />
        <span>WiFi</span>
    </TabAnchor>
</TabGroup>
