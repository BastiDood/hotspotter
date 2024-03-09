<script lang="ts">
    import type { NetworkType } from '$lib/models/cell';
    // eslint-disable-next-line init-declarations
    export let network_type: NetworkType | null;
    // eslint-disable-next-line init-declarations
    export let carrier_id: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let carrier_name: string | null | undefined;
    // eslint-disable-next-line init-declarations
    export let operator_id: string;
    // eslint-disable-next-line init-declarations
    export let operator_name: string;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Network Type</th>
                <th>Carrier ID</th>
                <th>Carrier Name</th>
                <th>Operator ID</th>
                <th>Operator Name</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{network_type}</td>
                <td>{carrier_id}</td>
                <td>{carrier_name}</td>
                <td>{operator_id}</td>
                <td>{operator_name}</td>
            </tr>
        </tbody>
    </table>
</div>
