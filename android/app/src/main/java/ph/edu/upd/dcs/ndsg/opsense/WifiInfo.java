package ph.edu.upd.dcs.ndsg.hotspotter;

import android.os.*;
import android.net.wifi.*;
import androidx.annotation.NonNull;
import com.getcapacitor.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.json.JSONArray;

public class WifiInfo {
    /** Android 11 and below just hard-coded into five tiers. */
    private static final int DEFAULT_MAX_LEVEL = 5;
    private @NonNull WifiManager api;

    WifiInfo(@NonNull WifiManager api) {
        this.api = api;
    }

    @NonNull
    private JSObject scanResultToJson(@NonNull ScanResult result) {
        var now = System.currentTimeMillis();
        var elapsed = SystemClock.elapsedRealtime();
        var timestamp = TimeUnit.MICROSECONDS.toMillis(result.timestamp);
        var unix = now - elapsed + timestamp;
        var standard = result.getWifiStandard();
        var json = new JSObject()
            .put("bssid", result.BSSID)
            .put("ssid", result.SSID)
            .put("rssi", result.level)
            .put("frequency", result.frequency)
            .put("channel_width", result.channelWidth)
            .put("center_freq_0", result.centerFreq0)
            .put("center_freq_1", result.centerFreq1)
            .put("wifi_timestamp", unix)
            .put("standard", standard == ScanResult.WIFI_STANDARD_UNKNOWN ? null : standard);
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.R
            ? json.put("level", api.calculateSignalLevel(result.level, DEFAULT_MAX_LEVEL)).put("max_level", DEFAULT_MAX_LEVEL)
            : json.put("level", api.calculateSignalLevel(result.level)).put("max_level", api.getMaxSignalLevel());
    }

    @NonNull
    public JSONArray getScanResults() {
        var results = api.getScanResults();
        results.sort((a, b) -> b.level - a.level);
        var list = results
            .stream()
            .map(this::scanResultToJson)
            .collect(Collectors.toList());
        return new JSONArray(list);
    }

    @NonNull
    public JSObject startScan() {
        return new JSObject().put("ok", api.startScan());
    }
}
