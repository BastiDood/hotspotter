<script lang="ts">
    import type { PermissionStatus } from '@capacitor/geolocation';

    // eslint-disable-next-line init-declarations
    export let location: PermissionStatus['location'];
    // eslint-disable-next-line init-declarations
    export let coarseLocation: PermissionStatus['coarseLocation'];
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Fine Location</th>
                <th>Coarse Location</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{location}</td>
                <td>{coarseLocation}</td>
            </tr>
        </tbody>
    </table>
</div>
