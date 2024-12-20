package ph.edu.upd.dcs.ndsg.hotspotter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle bundle) {
        registerPlugin(WifiInfoPlugin.class);
        registerPlugin(CredentialPlugin.class);
        registerPlugin(LoopPlugin.class);
        super.onCreate(bundle);
    }
}
