<script lang="ts">
    // eslint-disable-next-line init-declarations
    export let date: Date;
    // eslint-disable-next-line init-declarations
    export let latitude: number;
    // eslint-disable-next-line init-declarations
    export let longitude: number;
    // eslint-disable-next-line init-declarations
    export let accuracy: number;
    // eslint-disable-next-line init-declarations
    export let altitude: number | null;
    // eslint-disable-next-line init-declarations
    export let altitudeAccuracy: number | null | undefined;
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
                <td>{date.toLocaleString()}</td>
                <td>{latitude}</td>
                <td>{longitude}</td>
                <td>{accuracy}</td>
                <td>{altitude}</td>
                <td>{altitudeAccuracy}</td>
                <td>{speed}</td>
                <td>{heading}</td>
            </tr>
        </tbody>
    </table>
</div>
