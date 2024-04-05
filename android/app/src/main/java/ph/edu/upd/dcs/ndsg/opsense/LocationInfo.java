package ph.edu.upd.dcs.ndsg.hotspotter;

import android.location.LocationManager;
import android.os.Build;
import androidx.annotation.NonNull;
import com.getcapacitor.JSObject;
import java.util.Optional;

public class LocationInfo {
    private @NonNull LocationManager api;

    LocationInfo(@NonNull LocationManager api) {
        this.api = api;
    }

    @NonNull
    public Optional<JSObject> getLastKnownLocation() {
        return api.getAllProviders()
            .stream()
            .map(api::getLastKnownLocation)
            .max((a, b) -> {
                var first = a.getElapsedRealtimeNanos();
                var other = b.getElapsedRealtimeNanos();
                return Long.compare(other, first);
            })
            .map(location -> {
                var json = new JSObject()
                    .put("timestamp", location.getTime())
                    .put("latitude", location.getLatitude())
                    .put("longitude", location.getLongitude())
                    .put("coords_accuracy", location.hasAccuracy() ? location.getAccuracy() : JSObject.NULL)
                    .put("altitude", location.hasAltitude() ? location.getAltitude() : JSObject.NULL)
                    .put("speed", location.hasSpeed() ? location.getSpeed() : JSObject.NULL)
                    .put("heading", location.hasBearing() ? location.getBearing() : JSObject.NULL);
                return Build.VERSION.SDK_INT < Build.VERSION_CODES.O
                    ? json
                    : json.put("altitude_accuracy", location.hasVerticalAccuracy() ? location.getVerticalAccuracyMeters() : JSObject.NULL);
            });
    }
}
