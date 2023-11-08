<script lang="ts">
    import { Ratings } from '@skeletonlabs/skeleton';
    import { StarIcon } from '@krowten/svelte-heroicons';

    // eslint-disable-next-line init-declarations
    export let dbm: number;
    // eslint-disable-next-line init-declarations
    export let asu: number;
    // eslint-disable-next-line init-declarations
    export let level: number;
</script>

<Ratings spacing="" max={4} value={level}>
    <StarIcon class="h-4" slot="empty" />
    <StarIcon class="h-4" slot="full" solid />
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
