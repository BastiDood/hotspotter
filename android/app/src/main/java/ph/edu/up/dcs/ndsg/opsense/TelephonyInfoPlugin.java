package ph.edu.up.dcs.ndsg.opsense;

import android.content.Context;
import android.telephony.TelephonyManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.lang.Error;

@CapacitorPlugin(name = "TelephonyInfo")
public class TelephonyInfoPlugin extends Plugin {
    private TelephonyManager api;

    @Override
    public void load() throws Error {
        var service = getActivity().getSystemService(Context.TELEPHONY_SERVICE);
        if (service instanceof TelephonyManager tel) api = tel;
        else throw new Error("service is not an instance of TelephonyManager");
    }

    @PluginMethod()
    public void getNetworkOperatorName(PluginCall ctx) {
        var name = api.getSimCarrierIdName().toString();
        var res = new JSObject();
        res.put("name", name);
        ctx.resolve(res);
    }
}
