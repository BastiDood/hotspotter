package ph.edu.upd.dcs.ndsg.hotspotter;

import android.content.*;
import android.net.wifi.*;
import android.os.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.*;
import org.json.JSONArray;

@CapacitorPlugin(name = "WifiInfo")
public class WifiInfoPlugin extends Plugin {
    WifiManager api;
    WifiManager.ScanResultsCallback callback;

    /** Android 11 and below just hard-coded into five tiers. */
    private static final int DEFAULT_MAX_LEVEL = 5;

    private JSObject scanResultToJson(ScanResult result) {
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

    private JSObject scanResultsToResultJson(List<ScanResult> results) {
        results.sort((a, b) -> b.level - a.level);
        var list = results.stream().map(this::scanResultToJson).collect(Collectors.toList());
        return new JSObject().put("results", new JSONArray(list));
    }

    @Override
    public void load() {
        var act = getActivity();
        var exe = act.getMainExecutor();
        api = (WifiManager) act.getSystemService(Context.WIFI_SERVICE);
        callback = new WifiManager.ScanResultsCallback() {
            @Override
            public void onScanResultsAvailable() {
                // noinspection MissingPermission
                notifyListeners("scan", scanResultsToResultJson(api.getScanResults()));
            }
        };
        api.registerScanResultsCallback(exe, callback);
    }

    @Override
    public void handleOnDestroy() {
        api.unregisterScanResultsCallback(callback);
    }

    @PluginMethod()
    public void startScan(PluginCall ctx) {
        var result = api.startScan();
        var obj = new JSObject().put("ok", result);
        ctx.resolve(obj);
    }

    @PluginMethod()
    public void getScanResults(PluginCall ctx) {
        // noinspection MissingPermission
        ctx.resolve(scanResultsToResultJson(api.getScanResults()));
    }
}
