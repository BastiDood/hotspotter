<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let timestamp: Date;
    // eslint-disable-next-line init-declarations
    export let latitude: number;
    // eslint-disable-next-line init-declarations
    export let longitude: number;
    // eslint-disable-next-line init-declarations
    export let coords_accuracy: number | null;
    // eslint-disable-next-line init-declarations
    export let altitude: number | null;
    // eslint-disable-next-line init-declarations
    export let altitude_accuracy: number | null | undefined;
    // eslint-disable-next-line init-declarations
    export let speed: number | null;
    // eslint-disable-next-line init-declarations
    export let heading: number | null;
</script>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Accuracy (Coordinates)</th>
                <th>Altitude</th>
                <th>Accuracy (Altitude)</th>
                <th>Speed</th>
                <th>Heading</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{timestamp.toLocaleString()}</td>
                <td>{latitude}</td>
                <td>{longitude}</td>
                <td>{coords_accuracy}</td>
                <td>{altitude}</td>
                <td>{altitude_accuracy}</td>
                <td>{speed}</td>
                <td>{heading}</td>
            </tr>
        </tbody>
    </table>
</div>
