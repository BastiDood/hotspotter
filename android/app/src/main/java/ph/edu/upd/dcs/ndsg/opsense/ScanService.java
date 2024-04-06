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
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ForkJoinPool;

public class ScanService extends Service {
    public static final String SCAN = "ph.edu.upd.dcs.ndsg.hotspotter.SCAN";
    public static final String STOP = "ph.edu.upd.dcs.ndsg.hotspotter.STOP";
    private static final int START_FLAG_MASK = Service.START_FLAG_RETRY | Service.START_FLAG_REDELIVERY;

    private static @Nullable WifiManager.ScanResultsCallback callback;

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
                new LocationInfo(ContextCompat.getSystemService(ScanService.this, LocationManager.class))
                    .getLastKnownLocation()
                    .ifPresent(location -> {
                        // Retrieve data from the scan
                        var instant = SystemClock.currentNetworkTimeClock().instant();
                        var now = instant.toEpochMilli();
                        var net = new WifiInfo(ContextCompat.getSystemService(ScanService.this, WifiManager.class));
                        var tel = new TelephonyInfo(ContextCompat.getSystemService(ScanService.this, TelephonyManager.class));
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
                    });
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
        }
    }

    @Override
    @Nullable
    public IBinder onBind(Intent _intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        unregisterCallback();
        callback = null;
        stopSelf();
        super.onDestroy();
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int id) {
        var mask = flags & START_FLAG_MASK;
        outer: {
            if (mask == 0) {
                var action = intent.getAction();
                switch (action) {
                    case SCAN:
                        registerCallback();
                        ServiceCompat.startForeground(
                            this,
                            1,
                            createNotification("Scanner is idle."),
                            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
                        Log.i("ScanService", "service started");
                        break outer;
                    case STOP:
                        unregisterCallback();
                        Log.i("ScanService", "service stopped at ID " + Integer.toString(id));
                        break;
                    default:
                        Log.e("ScanService", "unknown action type -> " + action);
                        break;
                }
            } else {
                var message = "unexpected start flags -> " + Integer.toBinaryString(flags);
                Log.wtf("ScanService", message);
            }
            stopSelfResult(id);
        }
        return Service.START_NOT_STICKY;
    }
}
