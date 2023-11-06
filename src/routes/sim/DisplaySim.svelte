<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let networkType: number;
    // eslint-disable-next-line init-declarations
    export let carrierId: number;
    // eslint-disable-next-line init-declarations
    export let carrierName: string;
    // eslint-disable-next-line init-declarations
    export let operatorId: string;
    // eslint-disable-next-line init-declarations
    export let operatorName: string;
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
                <td>{networkType}</td>
                <td>{carrierId}</td>
                <td>{carrierName}</td>
                <td>{operatorId}</td>
                <td>{operatorName}</td>
            </tr>
        </tbody>
    </table>
</div>
