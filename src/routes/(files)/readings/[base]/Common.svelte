<script lang="ts">
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Ratings } from '@skeletonlabs/skeleton';
    import { Star as src } from '@steeze-ui/heroicons';

    // eslint-disable-next-line init-declarations
    export let dbm: number | undefined;
    // eslint-disable-next-line init-declarations
    export let asu: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let level: number;
</script>

<Ratings spacing="" max={4} value={level}>
    <Icon {src} class="h-4" slot="empty" />
    <Icon {src} class="h-4" slot="full" theme="solid" />
</Ratings>
<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Abstract Strength Units</th>
                <th>Signal Strength (dBm)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{asu}</td>
                <td>{dbm}</td>
            </tr>
        </tbody>
    </table>
</div>
