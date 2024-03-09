<script lang="ts">
    import { Cog6Tooth, Home, Map } from '@steeze-ui/heroicons';
    import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
    import { Icon } from '@steeze-ui/svelte-icon';
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
        <Icon src={Home} slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Home</span>
    </TabAnchor>
    <TabAnchor href="/map" selected={pathname === '/map/'}>
        <Icon src={Map} slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Map</span>
    </TabAnchor>
    <TabAnchor href="/settings" selected={pathname === '/settings/'}>
        <Icon src={Cog6Tooth} slot="lead" strokeWidth="1" class="m-auto h-6" />
        <span>Settings</span>
    </TabAnchor>
</TabGroup>
