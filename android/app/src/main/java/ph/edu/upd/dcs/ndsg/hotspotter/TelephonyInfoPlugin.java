package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.TelephonyManager;
import androidx.annotation.*;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(
    name = "TelephonyInfo",
    permissions = {
        @Permission(
            alias = "cell",
            strings = { Manifest.permission.READ_PHONE_STATE }
        )
    }
)
public class TelephonyInfoPlugin extends Plugin {
    @PluginMethod
    @RequiresPermission(Manifest.permission.READ_PHONE_STATE)
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_RADIO_ACCESS,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    public void getCellQuality(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), TelephonyManager.class);
        if (api == null) {
            ctx.unavailable("telephony manager is unavailable");
            return;
        }
        ctx.resolve(new TelephonyInfo(api).getCellQuality());
    }
}
