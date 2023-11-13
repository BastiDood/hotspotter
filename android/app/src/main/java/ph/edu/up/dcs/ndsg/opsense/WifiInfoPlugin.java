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
        // Compute signal level
        var level = api.calculateSignalLevel(result.level);
        var maxLevel = api.getMaxSignalLevel();

        // Compute Unix timestamp
        var now = System.currentTimeMillis();
        var elapsed = SystemClock.elapsedRealtime();
        var timestamp = TimeUnit.MICROSECONDS.toMillis(result.timestamp);
        var unix = now - elapsed + timestamp;

        return new JSObject()
            .put("bssid", result.BSSID)
            .put("ssid", result.SSID)
            .put("rssi", result.level)
            .put("level", level)
            .put("maxLevel", maxLevel)
            .put("frequency", result.frequency)
            .put("channelWidth", result.channelWidth)
            .put("centerFreq0", result.centerFreq0)
            .put("centerFreq1", result.centerFreq1)
            .put("timestamp", unix)
            .put("standard", result.getWifiStandard());
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
