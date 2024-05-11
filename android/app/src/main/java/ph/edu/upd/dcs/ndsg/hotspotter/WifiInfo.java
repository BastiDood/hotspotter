package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.os.*;
import android.net.wifi.*;
import android.util.Log;
import androidx.annotation.*;
import com.getcapacitor.*;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.json.JSONArray;
import org.json.JSONException;

public class WifiInfo {
    /** Android 11 and below just hard-coded into five tiers. */
    private static final int DEFAULT_MAX_LEVEL = 5;
    private @NonNull WifiManager api;

    WifiInfo(@NonNull WifiManager api) {
        this.api = api;
    }

    @Nullable
    private JSObject scanResultToJson(@NonNull ScanResult result) {
        var now = System.currentTimeMillis();
        var elapsed = SystemClock.elapsedRealtime();
        var timestamp = TimeUnit.MICROSECONDS.toMillis(result.timestamp);
        var unix = now - elapsed + timestamp;
        try {
            var json = new JSObject()
                .putSafe("bssid", result.BSSID)
                .putSafe("ssid", result.SSID)
                .putSafe("rssi", result.level)
                .putSafe("frequency", result.frequency)
                .putSafe("channel_width", result.channelWidth == ScanResult.UNSPECIFIED ? null : result.channelWidth)
                .putSafe("center_freq_0", result.centerFreq0 == ScanResult.UNSPECIFIED ? null : result.centerFreq0)
                .putSafe("center_freq_1", result.centerFreq1 == ScanResult.UNSPECIFIED ? null : result.centerFreq1)
                .putSafe("wifi_timestamp", unix);
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R)
                return json
                    .putSafe("level", api.calculateSignalLevel(result.level, DEFAULT_MAX_LEVEL))
                    .putSafe("max_level", DEFAULT_MAX_LEVEL);
            var standard = result.getWifiStandard();
            return json
                .putSafe("level", api.calculateSignalLevel(result.level))
                .putSafe("max_level", api.getMaxSignalLevel())
                .putSafe("standard", standard == ScanResult.WIFI_STANDARD_UNKNOWN ? JSObject.NULL : standard);
        } catch (JSONException err) {
            Log.e("WifiInfo", "cannot serialize scan result", err);
            return null;
        }
    }

    @NonNull
    @RequiresPermission(allOf = {
        Manifest.permission.ACCESS_WIFI_STATE,
        Manifest.permission.ACCESS_FINE_LOCATION,
    })
    public JSONArray getScanResults() {
        var results = api.getScanResults();
        results.sort((a, b) -> b.level - a.level);
        var list = results
            .stream()
            .map(this::scanResultToJson)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        return new JSONArray(list);
    }

    @NonNull
    @RequiresPermission(Manifest.permission.CHANGE_WIFI_STATE)
    public JSObject startScan() {
        return new JSObject().put("ok", api.startScan());
    }
}
