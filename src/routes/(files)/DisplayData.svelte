<script lang="ts">
    import { DocumentChartBar } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    // eslint-disable-next-line init-declarations
    export let readings: string[];
</script>

<nav class="card list-nav p-2">
    <ul>
        {#each readings as reading (reading)}
            {@const date = new Date(parseInt(reading.slice(0, reading.lastIndexOf('.json')), 10))}
            <li>
                <a href="/readings/{reading}">
                    <Icon src={DocumentChartBar} class="size-6" />
                    <div>
                        <p>{date.toLocaleString()}</p>
                        <code class="code">{reading}</code>
                    </div>
                </a>
            </li>
        {/each}
    </ul>
</nav>
