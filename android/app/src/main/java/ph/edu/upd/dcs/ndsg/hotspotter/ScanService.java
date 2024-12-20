package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.app.Notification;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.location.LocationManager;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.telephony.TelephonyManager;
import android.util.Log;
import androidx.core.content.ContextCompat;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.annotation.RequiresPermission;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.ServiceCompat;
import com.getcapacitor.JSObject;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.Runnable;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Optional;
import java.util.concurrent.ForkJoinPool;
import java.util.function.Consumer;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import org.json.JSONException;

public class ScanService extends Service {
    public static final String BIND = "ph.edu.upd.dcs.ndsg.hotspotter.BIND";
    public static final String SCAN = "ph.edu.upd.dcs.ndsg.hotspotter.SCAN";
    public static final String STOP = "ph.edu.upd.dcs.ndsg.hotspotter.STOP";

    private static final int START_FLAG_MASK = Service.START_FLAG_RETRY | Service.START_FLAG_REDELIVERY;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM);

    @NonNull
    private Notification createNotification(@NonNull String content) {
        return new NotificationCompat.Builder(this, "scan")
            .setSmallIcon(R.drawable.ic_stat_hotspotter)
            .setContentTitle("Hotspotter")
            .setContentText(content)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build();
    }

    private interface ICallback {
        void close();
    }

    private @Nullable ICallback callback;

    private class BroadcastCallback extends BroadcastReceiver implements ICallback {
        BroadcastCallback() {
            super();
            var filter = new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
            ContextCompat.registerReceiver(ScanService.this, this, filter, ContextCompat.RECEIVER_NOT_EXPORTED);
        }
        @Override
        @RequiresPermission(allOf = {
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.POST_NOTIFICATIONS,
            Manifest.permission.READ_PHONE_STATE,
        })
        public void onReceive(Context ctx, Intent intent) {
            if (intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false)) {
                var service = (ScanService) ctx;
                service.onNewScanResults();
            } else
                Log.w("ScanService", "no new results from broadcast receiver");
        }
        @Override
        public void close() {
            ScanService.this.unregisterReceiver(this);
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private class ScanResultsCallback extends WifiManager.ScanResultsCallback implements ICallback {
        @RequiresPermission(Manifest.permission.ACCESS_WIFI_STATE)
        ScanResultsCallback() {
            super();
            ContextCompat
                .getSystemService(ScanService.this, WifiManager.class)
                .registerScanResultsCallback(ForkJoinPool.commonPool(), this);
        }
        @Override
        @RequiresPermission(allOf = {
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.POST_NOTIFICATIONS,
            Manifest.permission.READ_PHONE_STATE,
        })
        public void onScanResultsAvailable() {
            ScanService.this.onNewScanResults();
        }
        @Override
        @RequiresPermission(Manifest.permission.ACCESS_WIFI_STATE)
        public void close() {
            ContextCompat
                .getSystemService(ScanService.this, WifiManager.class)
                .unregisterScanResultsCallback(this);
        }
    }

    @RequiresPermission(allOf = {
        Manifest.permission.ACCESS_WIFI_STATE,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.POST_NOTIFICATIONS,
        Manifest.permission.READ_PHONE_STATE,
    })
    private void onNewScanResults() {
        Log.i("ScanService", "reading triggered by callback");
        var zonedDateTime = ZonedDateTime.now();
        var now = zonedDateTime.toInstant().toEpochMilli();

        var net = new WifiInfo(ContextCompat.getSystemService(this, WifiManager.class));
        var wifi = net.getScanResults();

        var tel = new TelephonyInfo(ContextCompat.getSystemService(this, TelephonyManager.class));
        var sim = tel.getCellQuality();
        if (sim == null) {
            Log.e("ScanService", "cell information is unavailable... dropping this scan");
            return;
        }

        var loc = new LocationInfo(ContextCompat.getSystemService(this, LocationManager.class));
        var gps = LocationInfo.convertLocationToJson(loc.getCurrentLocation());
        if (gps == null) {
            Log.w("ScanService", "location is unavailable... dropping this scan");
            return;
        }

        // Save the reading to the cache
        var name = Long.toString(now) + ".json";
        var file = this.getCacheDir().toPath().resolve(name).toFile();

        Log.i("ScanService", "creating new file at " + file.toString());
        try {
            if (!file.createNewFile()) {
                Log.e("ScanService", name);
                return;
            }
        } catch (IOException err) {
            Log.e("ScanService", "cannot create cached file", err);
            return;
        }

        var json = new JSObject()
            .put("now", now)
            .put("gps", gps)
            .put("wifi", wifi)
            .put("sim", sim);
        var bytes = json.toString().getBytes(StandardCharsets.UTF_8);

        Log.i("ScanService", "writing to " + file.toString());
        try (var stream = new FileOutputStream(file)) {
            stream.write(bytes);
            stream.flush();
        } catch (IOException err) {
            Log.e("ScanService", "cannot write to cached file", err);
            return;
        }

        // Notify the user interface of the new reading
        var content = "Last cached on " + DATE_FORMATTER.format(zonedDateTime) + ".";
        var notification = this.createNotification(content);
        NotificationManagerCompat.from(this).notify(1, notification);
        Log.i("ScanService", "foreground notification updated");

        try {
            var data = new JSObject().putSafe("name", name);
            for (var consumer : watchers.values()) consumer.accept(data);
        } catch (JSONException err) {
            Log.e("ScanService", "cannot serialize file name to listeners", err);
        }
    }

    @RequiresPermission(Manifest.permission.ACCESS_WIFI_STATE)
    private void registerCallback() {
        if (callback != null) {
            Log.i("ScanService", "callback already exists");
            return;
        }
        callback = Build.VERSION.SDK_INT < Build.VERSION_CODES.R
            ? new BroadcastCallback()
            : new ScanResultsCallback();
        Log.i("ScanService", "callback initialized");
    }

    @RequiresPermission(Manifest.permission.ACCESS_WIFI_STATE)
    private void unregisterCallback() {
        if (callback == null) {
            Log.w("ScanService", "callback is already gone");
            return;
        }
        callback.close();
        callback = null;
        Log.i("ScanService", "callback unregistered");
    }

    private static Handler handler = Handler.createAsync(Looper.getMainLooper());
    private Runnable runnable;

    @Override
    public void onCreate() {
        runnable = new Runnable() {
            @Override
            @RequiresPermission(Manifest.permission.CHANGE_WIFI_STATE)
            public void run() {
                if (ContextCompat.getSystemService(ScanService.this, WifiManager.class).startScan())
                    Log.i("ScanService", "successfully requested a new scan");
                else
                    Log.e("ScanService", "scan attempt failed due to throttling");
                handler.postDelayed(this, 30_000);
            }
        };
        runnable.run();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(runnable);
    }

    private final LocalBinder binder = new LocalBinder();
    private final HashMap<String, Consumer<JSObject>> watchers = new HashMap<>();
    public class LocalBinder extends Binder {
        public void startWatch(@NonNull String id, @NonNull Consumer<JSObject> callback) {
            watchers.put(id, callback);
        }
        public void clearWatch(@NonNull String id) {
            watchers.remove(id);
        }
    }

    @Override
    @Nullable
    public LocalBinder onBind(Intent intent) {
        if (intent.getAction() != BIND) return null;
        registerCallback();
        ServiceCompat.startForeground(
            this,
            1,
            createNotification("Scanner is idle."),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        return binder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        unregisterCallback();
        return intent.getAction() == BIND;
    }

    @Override
    public void onRebind(Intent intent) {
        if (intent.getAction() == BIND) {
            registerCallback();
            ServiceCompat.startForeground(
                this,
                1,
                createNotification("Scanner has been restarted."),
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        }
    }
}
