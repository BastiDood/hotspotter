package ph.edu.upd.dcs.ndsg.hotspotter;

import android.os.CancellationSignal;
import androidx.credentials.*;
import androidx.credentials.exceptions.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.*;

@CapacitorPlugin(name = "Credential")
public class CredentialPlugin extends Plugin {
    @PluginMethod
    public void signIn(PluginCall ctx) {
        var id = ctx.getString("id");
        if (id == null) {
            ctx.reject("no web client id provided");
            return;
        }

        // TODO: Set up nonce for extra security.
        var option = new GetSignInWithGoogleOption.Builder(id).build();
        var request = new GetCredentialRequest.Builder().addCredentialOption(option).build();

        var act = getActivity();
        CredentialManager
            .create(act)
            .getCredentialAsync(
                act,
                request,
                null,
                act.getMainExecutor(),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse response) {
                        var cred = response.getCredential();
                        if (!cred.getType().equals(GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL)) return;
                        if (cred instanceof CustomCredential c) {
                            // TODO: Prefer to decode the ID Token directly.
                            var token = GoogleIdTokenCredential.createFrom(c.getData());
                            var json = new JSObject()
                                .put("id", token.getIdToken())
                                .put("name", token.getDisplayName())
                                .put("email", token.getId())
                                .put("picture", token.getProfilePictureUri());
                            ctx.resolve(json);
                        }
                    }

                    @Override
                    public void onError(GetCredentialException e) {
                        ctx.reject(e.getType() + " - " + e.getMessage(), e);
                    }
                }
            );
    }

    @PluginMethod
    public void signOut(PluginCall ctx) {
        var act = getActivity();
        CredentialManager
            .create(act)
            .clearCredentialStateAsync(
                new ClearCredentialStateRequest(),
                null,
                act.getMainExecutor(),
                new CredentialManagerCallback<Void, ClearCredentialException>() {
                    @Override
                    public void onResult(Void result) {
                        ctx.resolve();
                    }

                    @Override
                    public void onError(ClearCredentialException e) {
                        ctx.reject(e.getType() + " - " + e.getMessage(), e);
                    }
                }
            );
    }
}
