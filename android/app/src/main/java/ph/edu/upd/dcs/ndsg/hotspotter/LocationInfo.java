package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.location.*;
import android.os.*;
import android.util.Log;
import androidx.annotation.*;
import androidx.core.location.LocationManagerCompat;
import com.getcapacitor.JSObject;
import java.lang.InterruptedException;
import java.util.*;
import java.util.concurrent.*;

public class LocationInfo {
    private static final String PROVIDER = Build.VERSION.SDK_INT < Build.VERSION_CODES.S
        ? LocationManager.GPS_PROVIDER
        : LocationManager.FUSED_PROVIDER;
    private @NonNull LocationManager api;

    LocationInfo(@NonNull LocationManager api) {
        this.api = api;
    }

    private static JSObject convertLocationToJson(Location location) {
        return new JSObject()
            .put("timestamp", location.getTime())
            .put("latitude", location.getLatitude())
            .put("longitude", location.getLongitude())
            .put("coords_accuracy", location.hasAccuracy() ? location.getAccuracy() : JSObject.NULL)
            .put("altitude", location.hasAltitude() ? location.getAltitude() : JSObject.NULL)
            .put("altitude_accuracy", location.hasVerticalAccuracy() ? location.getVerticalAccuracyMeters() : JSObject.NULL)
            .put("speed", location.hasSpeed() ? location.getSpeed() : JSObject.NULL)
            .put("heading", location.hasBearing() ? location.getBearing() : JSObject.NULL);
    }

    @Nullable
    @RequiresPermission(anyOf = {
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
    })
    public JSObject getLastKnownLocation() {
        var now = SystemClock.elapsedRealtimeNanos();
        return api.getAllProviders()
            .stream()
            .map(api::getLastKnownLocation)
            .filter(Objects::nonNull)
            .max(Comparator.comparingLong(Location::getElapsedRealtimeNanos))
            .map(LocationInfo::convertLocationToJson)
            .orElse(null);
    }

    @Nullable
    @RequiresPermission(anyOf = {
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
    })
    public JSObject getCurrentLocation() {
        var thread = Thread.currentThread();
        var queue = new SynchronousQueue<Location>();
        LocationManagerCompat.getCurrentLocation(api, PROVIDER, null, ForkJoinPool.commonPool(), location -> {
            try {
                queue.put(location);
            } catch (InterruptedException err) {
                Log.e("LocationInfo", "producer thread for current location interrupted", err);
                thread.interrupt();
            }
        });
        try {
            var location = queue.take();
            return location == null ? null : convertLocationToJson(location);
        } catch (InterruptedException err) {
            Log.e("LocationInfo", "consumer thread for current location interrupted", err);
            return null;
        }
    }
}
