<script>
    import { Geolocation } from '@capacitor/geolocation';
    import { LightSwitch } from '@skeletonlabs/skeleton';
</script>

{#await Geolocation.requestPermissions({ permissions: ['location'] })}
    <p>Requesting permissions...</p>
{:then { location, coarseLocation }}
    {#if location === 'granted' || coarseLocation === 'granted'}
        {#await Geolocation.getCurrentPosition({ enableHighAccuracy: true })}
            <p>Loading...</p>
        {:then { timestamp, coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed, heading } }}
            {@const date = new Date(timestamp).toLocaleString()}
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
                            <td>{date}</td>
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
        {:catch err}
            <p>{err}</p>
        {/await}
    {:else}
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
    {/if}
{/await}
<LightSwitch />
