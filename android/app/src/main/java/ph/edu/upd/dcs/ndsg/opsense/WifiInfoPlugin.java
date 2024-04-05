package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.net.wifi.WifiManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.HashSet;

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
            var api = ContextCompat.getSystemService(getActivity(), WifiManager.class);
            var json = new WifiInfo(api).getScanResults();
            for (var id : watchers) getBridge().getSavedCall(id).resolve(json);
        }
    };

    @PluginMethod()
    public void startScan(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), WifiManager.class);
        ctx.resolve(new WifiInfo(api).startScan());
    }

    @PluginMethod()
    public void getScanResults(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), WifiManager.class);
        ctx.resolve(new WifiInfo(api).getScanResults());
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
            var api = ContextCompat.getSystemService(act, WifiManager.class);
            var exe = ContextCompat.getMainExecutor(act);
            api.registerScanResultsCallback(exe, callback);
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

        if (watchers.isEmpty()) {
            var act = getActivity();
            var api = ContextCompat.getSystemService(act, WifiManager.class);
            api.unregisterScanResultsCallback(callback);
        }

        ctx.resolve();
    }
}
