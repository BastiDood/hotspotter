package ph.edu.upd.dcs.ndsg.hotspotter;

import android.app.*;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.LocationManager;
import android.net.wifi.WifiManager;
import android.os.*;
import android.telephony.TelephonyManager;
import android.util.Log;
import androidx.core.content.ContextCompat;
import androidx.annotation.*;
import androidx.core.app.*;
import com.getcapacitor.JSObject;
import java.io.*;
import java.lang.Runnable;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.function.Consumer;

public class ScanService extends Service {
    public static final String BIND = "ph.edu.upd.dcs.ndsg.hotspotter.BIND";
    public static final String SCAN = "ph.edu.upd.dcs.ndsg.hotspotter.SCAN";
    public static final String STOP = "ph.edu.upd.dcs.ndsg.hotspotter.STOP";
    private static final int START_FLAG_MASK = Service.START_FLAG_RETRY | Service.START_FLAG_REDELIVERY;

    private static @Nullable WifiManager.ScanResultsCallback callback;

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

    private static Handler handler = Handler.createAsync(Looper.getMainLooper());
    private Runnable runnable;

    @NonNull
    private Notification createNotification(@NonNull String content) {
        return new NotificationCompat.Builder(this, "scan")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .setContentTitle("Hotspotter")
            .setContentText(content)
            .setOngoing(true)
            .build();
    }

    @NonNull
    private WifiManager.ScanResultsCallback createCallback() {
        return new WifiManager.ScanResultsCallback() {
            @Override
            public void onScanResultsAvailable() {
                var loc = new LocationInfo(ContextCompat.getSystemService(ScanService.this, LocationManager.class));
                var net = new WifiInfo(ContextCompat.getSystemService(ScanService.this, WifiManager.class));
                var tel = new TelephonyInfo(ContextCompat.getSystemService(ScanService.this, TelephonyManager.class));

                var location = loc.getLastKnownLocation();
                if (location == null) {
                    Log.w("ScanService", "location is unavailable");
                    return;
                }

                var instant = SystemClock.currentNetworkTimeClock().instant();
                var now = instant.toEpochMilli();
                var json = new JSObject()
                    .put("now", now)
                    .put("gps", location)
                    .put("wifi", net.getScanResults())
                    .put("sim", tel.getCellQuality());
                Log.i("ScanService", "reading triggered by callback");

                // Save the reading to the cache
                var name = Long.toString(now) + ".json";
                var file = ScanService.this.getCacheDir().toPath().resolve(name).toFile();

                Log.i("ScanService", "creating new file " + name);
                try {
                    if (!file.createNewFile()) {
                        Log.e("ScanService", name);
                        return;
                    }
                } catch (IOException err) {
                    Log.e("ScanService", "cannot create cached file", err);
                    return;
                }

                Log.i("ScanService", "writing to " + name);
                try (var stream = new FileOutputStream(file)) {
                    stream.write(json.toString().getBytes(StandardCharsets.UTF_8));
                    stream.flush();
                } catch (IOException err) {
                    Log.e("ScanService", "cannot write to cached file", err);
                    return;
                }

                // Notify the user interface of the new reading
                var content = "Last cached on " + instant.toString() + ".";
                var notification = ScanService.this.createNotification(content);
                NotificationManagerCompat.from(ScanService.this).notify(1, notification);
                Log.i("ScanService", "foreground notification updated");
                for (var consumer : watchers.values()) consumer.accept(json);
            }
        };
    }

    private void registerCallback() {
        if (callback == null) {
            callback = createCallback();
            ContextCompat
                .getSystemService(this, WifiManager.class)
                .registerScanResultsCallback(ForkJoinPool.commonPool(), callback);
            Log.i("ScanService", "callback initialized");
        } else
            Log.i("ScanService", "callback already exists");
    }

    private void unregisterCallback() {
        if (callback == null)
            Log.w("ScanService", "callback is already gone");
        else {
            ContextCompat
                .getSystemService(this, WifiManager.class)
                .unregisterScanResultsCallback(callback);
            Log.i("ScanService", "callback unregistered");
            callback = null;
        }
    }

    @Override
    public void onCreate() {
        runnable = new Runnable() {
            @Override
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
