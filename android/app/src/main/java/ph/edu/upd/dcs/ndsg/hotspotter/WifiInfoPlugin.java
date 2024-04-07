package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.net.wifi.WifiManager;
import android.os.Build;
import androidx.annotation.RequiresPermission;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.HashSet;

@CapacitorPlugin(
    name = "WifiInfo",
    permissions = {
        @Permission(
            alias = "wifi",
            strings = { Manifest.permission.CHANGE_WIFI_STATE }
        )
    }
)
public class WifiInfoPlugin extends Plugin {
    @PluginMethod
    @RequiresPermission(Manifest.permission.CHANGE_WIFI_STATE)
    public void startScan(PluginCall ctx) {
        var api = ContextCompat.getSystemService(getActivity(), WifiManager.class);
        ctx.resolve(new WifiInfo(api).startScan());
    }
}
