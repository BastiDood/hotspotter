package ph.edu.up.dcs.ndsg.opsense;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ph.edu.up.dcs.ndsg.opsense.*;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle bundle) {
        registerPlugin(TelephonyInfoPlugin.class);
        registerPlugin(WifiInfoPlugin.class);
        super.onCreate(bundle);
    }
}
