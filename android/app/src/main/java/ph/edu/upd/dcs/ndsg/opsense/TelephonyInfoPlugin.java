package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.telephony.TelephonyManager;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(
    name = "TelephonyInfo",
    permissions = { @Permission(strings = { Manifest.permission.READ_BASIC_PHONE_STATE }) }
)
public class TelephonyInfoPlugin extends Plugin {
    @PluginMethod()
    public void getCellQuality(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), TelephonyManager.class);
        if (api == null) {
            ctx.unavailable("telephony manager is unavailable");
            return;
        }
        ctx.resolve(new TelephonyInfo(api).getCellQuality());
    }
}
