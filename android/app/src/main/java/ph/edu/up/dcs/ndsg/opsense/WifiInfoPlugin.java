package ph.edu.up.dcs.ndsg.opsense;

import android.content.*;
import android.net.wifi.WifiManager;
import android.os.SystemClock;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.json.JSONArray;

@CapacitorPlugin(name = "WifiInfo")
public class WifiInfoPlugin extends Plugin {
    WifiManager api;
    WifiManager.ScanResultsCallback callback;

    @Override
    public void load() {
        var activity = getActivity();
        var exec = activity.getMainExecutor();

        api = (WifiManager) activity.getSystemService(Context.WIFI_SERVICE);
        callback = new WifiManager.ScanResultsCallback() {
            @Override
            public void onScanResultsAvailable() {
                var results = api
                    .getScanResults()
                    .stream()
                    .map(result -> {
                        // Compute signal level
                        var level = api.calculateSignalLevel(result.level);
                        var maxLevel = api.getMaxSignalLevel();

                        // Compute Unix timestamp
                        var now = System.currentTimeMillis();
                        var elapsed = SystemClock.elapsedRealtime();
                        var timestamp = TimeUnit.MICROSECONDS.convert(result.timestamp, TimeUnit.MILLISECONDS);
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
                    })
                    .collect(Collectors.toList());
                var obj = new JSObject().put("results", new JSONArray(results));
                notifyListeners("scan", obj);
            }
        };

        api.registerScanResultsCallback(exec, callback);
    }

    @Override
    public void handleOnDestroy() {
        api.unregisterScanResultsCallback(callback);
    }

    @PluginMethod()
    public void startScan(PluginCall ctx) {
        var result = api.startScan();
        var obj = new JSObject().put("result", result);
        ctx.resolve(obj);
    }
}
