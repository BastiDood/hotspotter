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
    public void getSim(PluginCall ctx) {
        var res = new JSObject()
            .put("networkType", api.getDataNetworkType())
            .put("carrierId", api.getSimCarrierId())
            .put("carrierName", api.getSimCarrierIdName().toString())
            .put("operatorId", api.getSimOperator())
            .put("operatorName", api.getSimOperatorName());
        ctx.resolve(res);
    }

    @PluginMethod()
    public void getSignalStrength(PluginCall ctx) {
        var strength = api.getSignalStrength();
        var res = new JSObject()
            .put("timestamp", strength.getTimestampMillis())
            .put("level", strength.getLevel());
        ctx.resolve(res);
    }
}
