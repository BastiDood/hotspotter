package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.location.*;
import android.os.*;
import androidx.annotation.*;
import com.getcapacitor.JSObject;
import java.util.*;

public class LocationInfo {
    private @NonNull LocationManager api;

    LocationInfo(@NonNull LocationManager api) {
        this.api = api;
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
            .map(location -> new JSObject()
                .put("timestamp", location.getTime())
                .put("latitude", location.getLatitude())
                .put("longitude", location.getLongitude())
                .put("coords_accuracy", location.hasAccuracy() ? location.getAccuracy() : JSObject.NULL)
                .put("altitude", location.hasAltitude() ? location.getAltitude() : JSObject.NULL)
                .put("altitude_accuracy", location.hasVerticalAccuracy() ? location.getVerticalAccuracyMeters() : JSObject.NULL)
                .put("speed", location.hasSpeed() ? location.getSpeed() : JSObject.NULL)
                .put("heading", location.hasBearing() ? location.getBearing() : JSObject.NULL))
            .orElse(null);
    }
}
