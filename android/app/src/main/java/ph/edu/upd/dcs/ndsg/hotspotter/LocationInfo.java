package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.annotation.RequiresPermission;
import androidx.core.location.LocationManagerCompat;
import com.getcapacitor.JSObject;
import java.lang.InterruptedException;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.TimeUnit;
import org.json.JSONException;

public class LocationInfo {
    private @NonNull LocationManager api;

    LocationInfo(@NonNull LocationManager api) {
        this.api = api;
    }

    @Nullable
    public static JSObject convertLocationToJson(@Nullable Location location) {
        if (location == null) return null;
        try {
            return new JSObject()
                .putSafe("timestamp", location.getTime())
                .putSafe("latitude", location.getLatitude())
                .putSafe("longitude", location.getLongitude())
                .putSafe("coords_accuracy", location.hasAccuracy() ? location.getAccuracy() : JSObject.NULL)
                .putSafe("altitude", location.hasAltitude() ? location.getAltitude() : JSObject.NULL)
                .putSafe("altitude_accuracy", location.hasVerticalAccuracy() ? location.getVerticalAccuracyMeters() : JSObject.NULL)
                .putSafe("speed", location.hasSpeed() ? location.getSpeed() : JSObject.NULL)
                .putSafe("heading", location.hasBearing() ? location.getBearing() : JSObject.NULL);
        } catch (JSONException err) {
            Log.e("LocationInfo", "cannot convert location to json", err);
            return null;
        }
    }

    @Nullable
    @RequiresPermission(anyOf = {
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
    })
    private Location getCurrentLocationByProvider(String provider) {
        var future = new CompletableFuture<Location>();
        LocationManagerCompat.getCurrentLocation(api, provider, null, ForkJoinPool.commonPool(), location -> {
            if (future.complete(location)) return;
            Log.wtf("LocationInfo", "location callback already completed");
        });
        while (true)
            try {
                Log.i("LocationInfo", "getting async " + provider + " location");
                return future.get(5, TimeUnit.SECONDS);
            } catch (TimeoutException ex) {
                Log.w("LocationInfo", "five-second timeout for async " + provider + " location expired", ex);
                return null;
            } catch (InterruptedException ex) {
                Log.e("LocationInfo", provider + " location thread interrupted while waiting for callback... trying again", ex);
            } catch (CancellationException ex) {
                Log.wtf("LocationInfo", provider + " location request cancelled", ex);
                return null;
            } catch (ExecutionException ex) {
                Log.wtf("LocationInfo", provider + " location callback panicked", ex);
                return null;
            }
    }

    @Nullable
    @RequiresPermission(anyOf = {
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
    })
    public Location getCurrentLocation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            var fused = getCurrentLocationByProvider(LocationManager.FUSED_PROVIDER);
            if (fused != null) return fused;
        }
        var gps = getCurrentLocationByProvider(LocationManager.GPS_PROVIDER);
        if (gps != null) return gps;
        var net = getCurrentLocationByProvider(LocationManager.NETWORK_PROVIDER);
        if (net != null) return net;
        return getCurrentLocationByProvider(LocationManager.PASSIVE_PROVIDER);
    }
}
