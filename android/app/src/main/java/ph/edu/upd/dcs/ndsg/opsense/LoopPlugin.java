package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.*;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.Observer;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.HashMap;

@CapacitorPlugin(
    name = "LoopPlugin",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class LoopPlugin extends Plugin {
    private HashMap<String, Observer<JSObject>> watchers = new HashMap<>();

    @PluginMethod()
    public void requestScan(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), WifiManager.class);
        ctx.resolve(new WifiInfo(api).startScan());
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void startWatch(PluginCall ctx) {
        ctx.setKeepAlive(true);
        var id = ctx.getCallbackId();
        var observer = watchers.put(id, new Observer<>() {
            @Override
            public void onChanged(@NonNull JSObject data) {
                getBridge().getSavedCall(id).resolve(data);
            }
        });
        ScanResultsLiveData.getInstance().observe(getActivity(), observer);
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void clearWatch(PluginCall ctx) {
        var id = ctx.getString("id");
        if (id == null) {
            ctx.reject("no watch id specified");
            return;
        }

        var observer = watchers.remove(id);
        if (observer == null) {
            ctx.reject("observer does not exist");
            return;
        }

        ScanResultsLiveData.getInstance().removeObserver(observer);
        getBridge().releaseCall(id);
        ctx.resolve();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void startService(PluginCall ctx) {
        // Create the notification channel for Android 8.0+
        var activity = getActivity();
        var channel = new NotificationChannelCompat.Builder("scan", NotificationManagerCompat.IMPORTANCE_DEFAULT).build();
        NotificationManagerCompat.from(activity).createNotificationChannel(channel);

        // Finally start the foreground service
        var intent = new Intent(ScanService.SCAN, null, activity, ScanService.class);
        ContextCompat.startForegroundService(activity, intent);
        ctx.resolve();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void stopService(PluginCall ctx) {
        var activity = getActivity();
        var intent = new Intent(ScanService.STOP, null, activity, ScanService.class);
        activity.stopService(intent);
        ctx.resolve();
    }
}
