package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.*;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(
    name = "LoopPlugin",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class LoopPlugin extends Plugin {
    @PluginMethod()
    public void startLoopForegroundService(PluginCall ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            ctx.unavailable();
            return;
        }

        var activity = getActivity();

        // Create the notification channel for Android 8.0+
        var channel = new NotificationChannelCompat.Builder("scan", NotificationManagerCompat.IMPORTANCE_DEFAULT).build();
        NotificationManagerCompat.from(activity).createNotificationChannel(channel);

        // Finally start the foreground service
        var intent = new Intent(activity, ScanService.class);
        ContextCompat.startForegroundService(activity, intent);

        ctx.resolve();
    }
}
