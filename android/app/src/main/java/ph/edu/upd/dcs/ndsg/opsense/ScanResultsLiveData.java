package ph.edu.upd.dcs.ndsg.hotspotter;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;
import com.getcapacitor.JSObject;
import java.time.Instant;

public class ScanResultsLiveData {
    /** Latest timestamp that has been uploaded. */
    private static MutableLiveData<JSObject> timestamp = new MutableLiveData<>();

    @NonNull
    public static MutableLiveData<JSObject> getInstance() {
        return timestamp;
    }
}
