package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.content.*;
import android.net.wifi.*;
import android.os.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.*;
import org.json.JSONArray;

@CapacitorPlugin(
    name = "WifiInfo",
    permissions = {
        @Permission(strings = {
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION
        })
    }
)
public class WifiInfoPlugin extends Plugin {
    HashSet<String> watchers = new HashSet<>();
    WifiManager.ScanResultsCallback callback = new WifiManager.ScanResultsCallback() {
        @Override
        public void onScanResultsAvailable() {
            var json = scanResultsToResultJson(getApi());
            for (var id : watchers) {
                getBridge().getSavedCall(id).resolve(json);
            }
        }
    };

    /** Android 11 and below just hard-coded into five tiers. */
    private static final int DEFAULT_MAX_LEVEL = 5;

    private JSObject scanResultToJson(WifiManager api, ScanResult result) {
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

    private JSObject scanResultsToResultJson(WifiManager api) {
        var results = api.getScanResults();
        results.sort((a, b) -> b.level - a.level);
        var list = results.stream().map(result -> scanResultToJson(api, result)).collect(Collectors.toList());
        return new JSObject().put("results", new JSONArray(list));
    }

    private WifiManager getApi() {
        return (WifiManager) getActivity().getSystemService(Context.WIFI_SERVICE);
    }

    @PluginMethod()
    public void startScan(PluginCall ctx) {
        ctx.resolve(new JSObject().put("ok", getApi().startScan()));
    }

    @PluginMethod()
    public void getScanResults(PluginCall ctx) {
        ctx.resolve(scanResultsToResultJson(getApi()));
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void startWatch(PluginCall ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            ctx.unavailable();
            return;
        }

        var shouldInit = watchers.isEmpty();
        ctx.setKeepAlive(true);
        watchers.add(ctx.getCallbackId());

        if (shouldInit) {
            var act = getActivity();
            var api = (WifiManager) act.getSystemService(Context.WIFI_SERVICE);
            api.registerScanResultsCallback(act.getMainExecutor(), callback);
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void clearWatch(PluginCall ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            ctx.unavailable();
            return;
        }

        var id = ctx.getString("id");
        watchers.remove(id);
        getBridge().releaseCall(id);

        if (watchers.isEmpty()) getApi().unregisterScanResultsCallback(callback);
        ctx.resolve();
    }
}
