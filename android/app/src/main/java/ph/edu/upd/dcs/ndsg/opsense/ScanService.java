package ph.edu.upd.dcs.ndsg.hotspotter;

import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.LocationManager;
import android.net.wifi.WifiManager;
import android.os.SystemClock;
import android.telephony.TelephonyManager;
import android.os.IBinder;
import android.util.Log;
import androidx.core.content.ContextCompat;
import androidx.annotation.Nullable;
import androidx.core.app.*;
import com.getcapacitor.JSObject;
import java.io.*;
import java.net.*;
import java.util.concurrent.ForkJoinPool;

public class ScanService extends Service {
    @Override
    @Nullable
    public IBinder onBind(Intent _intent) {
        return null;
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int _flags, int id) {
        var uri = intent.getData();
        var scheme = uri.getScheme();
        var host = uri.getHost();
        var port = uri.getPort();
        var path = uri.getPath();
        try {
            var url = new URL(scheme, host, port, path);
            var callback = new WifiManager.ScanResultsCallback() {
                @Override
                public void onScanResultsAvailable() {
                    new LocationInfo(ContextCompat.getSystemService(ScanService.this, LocationManager.class))
                        .getLastKnownLocation()
                        .ifPresent(location -> {
                            var net = new WifiInfo(ContextCompat.getSystemService(ScanService.this, WifiManager.class));
                            var tel = new TelephonyInfo(ContextCompat.getSystemService(ScanService.this, TelephonyManager.class));
                            var bytes = new JSObject()
                                .put("gps", location)
                                .put("wifi", net.getScanResults())
                                .put("sim", tel.getCellQuality())
                                .toString()
                                .getBytes();
                            var timestamp = SystemClock.currentNetworkTimeClock().millis();
                            var name = Long.toString(timestamp) + ".json";
                            var file = ScanService.this.getCacheDir().toPath().resolve(name).toFile();
                            try {
                                if (!file.createNewFile()) {
                                    Log.e("ScanService", name);
                                    return;
                                }
                                try (var stream = new FileOutputStream(file)) {
                                    stream.write(bytes);
                                    stream.flush();
                                }
                            } catch (IOException err) {
                                Log.e("ScanService", "cannot cache reading", err);
                            }
                        });
                }
            };
            ContextCompat
                .getSystemService(this, WifiManager.class)
                .registerScanResultsCallback(ForkJoinPool.commonPool(), callback);
        } catch (MalformedURLException err) {
            // TODO: Show notification that service initialization failed.
            Log.e("ScanService", "bad url provided", err);
            stopSelfResult(id);
            return Service.START_NOT_STICKY;
        }
        // Show the persistent notification
        var notification = new NotificationCompat.Builder(this, "scan")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .setContentTitle("Hotspotter")
            .setContentInfo("Scanner is idle.")
            .setOngoing(true)
            .build();
        ServiceCompat.startForeground(this, 1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        return Service.START_STICKY;
    }
}
