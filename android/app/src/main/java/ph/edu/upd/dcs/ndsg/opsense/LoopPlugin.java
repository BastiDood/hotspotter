package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.app.NotificationManager;
import android.content.*;
import android.net.wifi.WifiManager;
import android.os.*;
import android.util.Log;
import androidx.annotation.*;
import androidx.core.app.*;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.lang.SecurityException;

@CapacitorPlugin(
    name = "LoopPlugin",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class LoopPlugin extends Plugin {
    private boolean bound = false;
    private @Nullable ScanService.LocalBinder service;
    private ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            service = (ScanService.LocalBinder) binder;
        }
        @Override
        public void onServiceDisconnected(ComponentName name) {
            service = null;
        }
    };

    @Override
    public void load() {
        super.load();
        try {
            var result = bind();
            if (result == null) Log.w("LoopPlugin", "service already bound");
            else if (result) Log.i("LoopPlugin", "binding to service");
            else Log.e("LoopPlugin", "service is non-existent or already initialized");
        } catch (SecurityException err) {
            Log.e("LoopPlugin", "unauthorized binding to service", err);
        }
        unbind();
    }

    private Boolean bind() throws SecurityException {
        if (bound) return null;
        bound = true;
        var activity = getActivity();
        var intent = new Intent(ScanService.BIND, null, activity, ScanService.class);
        return activity.bindService(intent, conn, Context.BIND_AUTO_CREATE);
    }

    private void unbind() {
        if (bound) {
            getActivity().unbindService(conn);
            service = null;
            bound = false;
        }
    }

    @Override
    public void handleOnDestroy() {
        unbind();
        super.handleOnDestroy();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void startWatch(PluginCall ctx) {
        if (service == null) {
            ctx.unavailable("service binder is not connected");
            return;
        }
        ctx.setKeepAlive(true);
        var id = ctx.getCallbackId();
        service.startWatch(id, data -> getBridge().getSavedCall(id).resolve(data));
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void clearWatch(PluginCall ctx) {
        var id = ctx.getString("id");
        if (id == null) {
            ctx.reject("no watch id specified");
            return;
        }
        if (service == null) {
            ctx.unavailable("service binder is not connected");
            return;
        }
        service.clearWatch(id);
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
        unbind();
        var activity = getActivity();
        var intent = new Intent(ScanService.STOP, null, activity, ScanService.class);
        activity.stopService(intent);
        ctx.resolve();
    }
}
