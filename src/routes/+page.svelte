<script>
    import { Geolocation } from '@capacitor/geolocation';
    import { LightSwitch } from '@skeletonlabs/skeleton';
    import { Network } from '$lib/model.js';
    import { array, parse } from 'valibot';
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
            {#await import('@awesome-cordova-plugins/wifi-wizard-2') then { WifiWizard2 }}
                {#await WifiWizard2.scan()}
                    <p>Scanning...</p>
                {:then payload}
                    {@const networks = parse(array(Network), payload)}
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>BSSID</th>
                                    <th>SSID</th>
                                    <th>RSSI</th>
                                    <th>Channel Width</th>
                                    <th>Frequency (MHz)</th>
                                    <th>Center Frequency 1 (MHz)</th>
                                    <th>Center Frequency 2 (MHz)</th>
                                    <th>Capabilities</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each networks as { BSSID, SSID, level, channelWidth, frequency, centerFreq0, centerFreq1, capabilities } (BSSID)}
                                    {@const date = new Date(timestamp).toLocaleString()}
                                    <tr>
                                        <th>{date}</th>
                                        <td>{BSSID}</td>
                                        <td>{SSID}</td>
                                        <td>{level}</td>
                                        <td>{channelWidth}</td>
                                        <td>{frequency}</td>
                                        <td>{centerFreq0}</td>
                                        <td>{centerFreq1}</td>
                                        <td>{capabilities}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:catch err}
                    <p>{err}</p>
                {/await}
            {/await}
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
