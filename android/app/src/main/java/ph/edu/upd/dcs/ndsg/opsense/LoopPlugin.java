package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.*;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(
    name = "LoopPlugin",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class LoopPlugin extends Plugin {
    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void startWatch(PluginCall ctx) {
        ctx.setKeepAlive(true);
        var id = ctx.getCallbackId();
        // TODO: Watch Mode
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void clearWatch(PluginCall ctx) {
        var id = ctx.getString("id");
        if (id == null) {
            ctx.reject("no watch id specified");
            return;
        }
        // TODO: Clear Watch
        getBridge().releaseCall(id);
        ctx.resolve();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void startService(PluginCall ctx) {
        // Create the notification channel for Android 8.0+
        var activity = getActivity();
        var channel = new NotificationChannelCompat.Builder("scan", NotificationManagerCompat.IMPORTANCE_DEFAULT)
            .setName("Hotspotter Upload Service")
            .setDescription("Listens for new Wi-Fi scans.")
            .build();
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
