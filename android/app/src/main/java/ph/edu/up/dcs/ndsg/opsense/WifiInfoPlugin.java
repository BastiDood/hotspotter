package ph.edu.up.dcs.ndsg.opsense;

import android.content.*;
import android.net.wifi.*;
import android.os.SystemClock;
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

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            // Old versions of Android just hard-coded into five tiers.
            var level = api.calculateSignalLevel(result.level, 5);
            json.put("level", level).put("max_level", 5);
        } else {
            var level = api.calculateSignalLevel(result.level);
            var maxLevel = api.getMaxSignalLevel();
            json.put("level", level).put("max_level", maxLevel);
        }

        return json;
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
        ctx.resolve(scanResultsToResultJson(api.getScanResults()));
    }
}
