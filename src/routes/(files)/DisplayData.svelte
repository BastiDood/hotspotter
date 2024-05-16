<script lang="ts">
    import { DocumentChartBar } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    // eslint-disable-next-line init-declarations
    export let readings: string[];
</script>

<nav class="card list-nav p-2">
    <ul>
        {#each readings as reading (reading)}
            <li>
                <a href="/readings/{reading}">
                    <Icon src={DocumentChartBar} class="size-6" />
                    <span class="flex-auto">{reading}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>
