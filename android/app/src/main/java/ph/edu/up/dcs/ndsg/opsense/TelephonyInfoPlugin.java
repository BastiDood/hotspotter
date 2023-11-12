package ph.edu.up.dcs.ndsg.opsense;

import android.content.Context;
import android.telephony.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TelephonyInfo")
public class TelephonyInfoPlugin extends Plugin {
    private TelephonyManager api;

    @Override
    public void load() throws Error {
        api = (TelephonyManager) getActivity().getSystemService(Context.TELEPHONY_SERVICE);
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

    @PluginMethod()
    public void getSignalStrengths(PluginCall ctx) throws Error {
        var res = new JSObject();
        for (var strength : api.getSignalStrength().getCellSignalStrengths()) {
            var json = new JSObject()
                .put("dbm", strength.getDbm())
                .put("asu", strength.getAsuLevel())
                .put("level", strength.getLevel());
            // TODO: Use `switch` expressions.
            if (strength instanceof CellSignalStrengthCdma s) {
                json.put("cdmaDbm", s.getCdmaDbm())
                    .put("cdmaEcio", s.getCdmaEcio())
                    .put("cdmaLevel", s.getCdmaLevel())
                    .put("evdoDbm", s.getEvdoDbm())
                    .put("evdoEcio", s.getEvdoEcio())
                    .put("evdoLevel", s.getEvdoLevel())
                    .put("evdoSnr", s.getEvdoSnr());
                res.put("cdma", json);
            } else if (strength instanceof CellSignalStrengthGsm s) {
                json.put("bitErrorRate", s.getBitErrorRate())
                    .put("rssi", s.getRssi())
                    .put("timingAdvance", s.getTimingAdvance());
                res.put("gsm", json);
            } else if (strength instanceof CellSignalStrengthLte s) {
                json.put("cqi", s.getCqi())
                    .put("cqiTableIndex", s.getCqiTableIndex())
                    .put("rsrp", s.getRsrp())
                    .put("rsrq", s.getRsrq())
                    .put("rssi", s.getRssi())
                    .put("rssnr", s.getRssnr())
                    .put("timingAdvance", s.getTimingAdvance());
                res.put("lte", json);
            } else if (strength instanceof CellSignalStrengthNr s) {
                // TODO: getCsiCqiReport
                json.put("csiCqiTableIndex", s.getCsiCqiTableIndex())
                    .put("csiRsrp", s.getCsiRsrp())
                    .put("csiRsrq", s.getCsiRsrq())
                    .put("csiSinr", s.getCsiSinr())
                    .put("ssRsrp", s.getSsRsrp())
                    .put("ssRsrq", s.getSsRsrq())
                    .put("ssSinr", s.getSsSinr());
                res.put("nr", json);
            } else if (strength instanceof CellSignalStrengthTdscdma s) {
                json.put("rscp", s.getRscp());
                res.put("tdscdma", json);
            } else if (strength instanceof CellSignalStrengthWcdma s) {
                json.put("ecNo", s.getEcNo());
                res.put("wcdma", json);
            }
        }
        ctx.resolve(res);
    }
}
