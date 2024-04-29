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
    permissions = {
        @Permission(
            alias = "Notification",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        ),
        @Permission(
            alias = "WiFi",
            strings = {
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE,
                Manifest.permission.ACCESS_FINE_LOCATION,
            }
        ),
        @Permission(
            alias = "Cellular",
            strings = { Manifest.permission.READ_PHONE_STATE }
        ),
    }
)
public class LoopPlugin extends Plugin {
    private boolean bound = false;
    private @Nullable ScanService.LocalBinder service;
    private ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onNullBinding(ComponentName name) {
            Log.wtf("ServiceConnection", "unrecognized intent action for -> " + name);
            service = null;
            bound = false;
        }
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            Log.i("ServiceConnection", "service connected for -> " + name);
            service = (ScanService.LocalBinder) binder;
            bound = true;
        }
        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.wtf("ServiceConnection", "service disconnected for -> " + name);
            bound = false;
        }
    };

    private Boolean bind() throws SecurityException {
        if (bound) return null;
        bound = true;
        var activity = getActivity();
        var channel = new NotificationChannelCompat.Builder("scan", NotificationManagerCompat.IMPORTANCE_LOW)
            .setName("Hotspotter Upload Service")
            .setDescription("Listens for new Wi-Fi scans.")
            .setVibrationEnabled(false)
            .build();
        NotificationManagerCompat.from(activity).createNotificationChannel(channel);
        var intent = new Intent(ScanService.BIND, null, activity, ScanService.class);
        return activity.bindService(intent, conn, Context.BIND_AUTO_CREATE);
    }

    private void unbind() {
        if (bound) {
            getActivity().unbindService(conn);
            bound = false;
        }
    }

    private void checkedBoot() {
        if (getPermissionStates().values().stream().anyMatch(state -> state != PermissionState.GRANTED)) {
            Log.w("LoopPlugin", "insufficient permissions to start service");
            return;
        }
        try {
            var result = bind();
            if (result == null) Log.w("LoopPlugin", "service already bound");
            else if (result) Log.i("LoopPlugin", "binding to service");
            else Log.e("LoopPlugin", "service is non-existent or already initialized");
        } catch (SecurityException err) {
            Log.e("LoopPlugin", "unauthorized binding to service", err);
        }
    }

    @Override
    public void load() {
        super.load();
        checkedBoot();
    }

    @Override
    public void handleOnDestroy() {
        unbind();
        super.handleOnDestroy();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void startWatch(PluginCall ctx) {
        if (bound) {
            ctx.setKeepAlive(true);
            var id = ctx.getCallbackId();
            service.startWatch(id, data -> getBridge().getSavedCall(id).resolve(data));
            return;
        }
        ctx.unavailable("loop service is turned off");
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void clearWatch(PluginCall ctx) {
        var id = ctx.getString("id");
        if (id == null) {
            ctx.reject("no watch id specified");
            return;
        }
        if (bound) {
            service.clearWatch(id);
            getBridge().releaseCall(id);
            ctx.resolve();
            return;
        }
        ctx.unavailable("loop service is turned off");
    }

    @PluginMethod
    public void bootService(PluginCall ctx) {
        checkedBoot();
        ctx.resolve(new JSObject().put("bound", bound));
    }
}
