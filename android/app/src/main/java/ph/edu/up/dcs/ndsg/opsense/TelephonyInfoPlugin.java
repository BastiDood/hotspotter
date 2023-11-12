package ph.edu.up.dcs.ndsg.opsense;

import android.content.Context;
import android.os.SystemClock;
import android.telephony.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TelephonyInfo")
public class TelephonyInfoPlugin extends Plugin {
    private TelephonyManager api;
    private Callback callback;

    private class Callback extends TelephonyCallback implements TelephonyCallback.SignalStrengthsListener {
        @Override
        public void onSignalStrengthsChanged(SignalStrength strength) {
            notifyListeners("strength", signalStrengthToJson(strength));
        }
    }

    private JSObject signalStrengthToJson(SignalStrength strength) {
        var now = System.currentTimeMillis();
        var elapsed = SystemClock.elapsedRealtime();
        var timestamp = strength.getTimestampMillis();
        var res = new JSObject()
            .put("timestamp", now - elapsed + timestamp)
            .put("level", strength.getLevel());
        for (var cell : api.getSignalStrength().getCellSignalStrengths()) {
            var json = new JSObject()
                .put("dbm", cell.getDbm())
                .put("asu", cell.getAsuLevel())
                .put("level", cell.getLevel());
            // TODO: Use `switch` expressions.
            if (cell instanceof CellSignalStrengthCdma s) {
                json.put("cdmaDbm", s.getCdmaDbm())
                    .put("cdmaEcio", s.getCdmaEcio())
                    .put("cdmaLevel", s.getCdmaLevel())
                    .put("evdoDbm", s.getEvdoDbm())
                    .put("evdoEcio", s.getEvdoEcio())
                    .put("evdoLevel", s.getEvdoLevel())
                    .put("evdoSnr", s.getEvdoSnr());
                res.put("cdma", json);
            } else if (cell instanceof CellSignalStrengthGsm s) {
                json.put("bitErrorRate", s.getBitErrorRate())
                    .put("rssi", s.getRssi())
                    .put("timingAdvance", s.getTimingAdvance());
                res.put("gsm", json);
            } else if (cell instanceof CellSignalStrengthLte s) {
                json.put("cqi", s.getCqi())
                    .put("cqiTableIndex", s.getCqiTableIndex())
                    .put("rsrp", s.getRsrp())
                    .put("rsrq", s.getRsrq())
                    .put("rssi", s.getRssi())
                    .put("rssnr", s.getRssnr())
                    .put("timingAdvance", s.getTimingAdvance());
                res.put("lte", json);
            } else if (cell instanceof CellSignalStrengthNr s) {
                // TODO: getCsiCqiReport
                // TODO: getTimingAdvanceMicros
                json.put("csiCqiTableIndex", s.getCsiCqiTableIndex())
                    .put("csiRsrp", s.getCsiRsrp())
                    .put("csiRsrq", s.getCsiRsrq())
                    .put("csiSinr", s.getCsiSinr())
                    .put("ssRsrp", s.getSsRsrp())
                    .put("ssRsrq", s.getSsRsrq())
                    .put("ssSinr", s.getSsSinr());
                res.put("nr", json);
            } else if (cell instanceof CellSignalStrengthTdscdma s) {
                json.put("rscp", s.getRscp());
                res.put("tdscdma", json);
            } else if (cell instanceof CellSignalStrengthWcdma s) {
                json.put("ecNo", s.getEcNo());
                res.put("wcdma", json);
            }
        }
        return res;
    }

    @Override
    public void load() {
        var act = getActivity();
        var exe = act.getMainExecutor();
        api = (TelephonyManager) act.getSystemService(Context.TELEPHONY_SERVICE);
        callback = new Callback();
        api.registerTelephonyCallback(exe, callback);
    }

    @Override
    public void handleOnDestroy() {
        api.unregisterTelephonyCallback(callback);
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
        ctx.resolve(signalStrengthToJson(api.getSignalStrength()));
    }
}
