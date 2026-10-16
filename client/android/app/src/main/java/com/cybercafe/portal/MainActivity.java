package com.cybercafe.portal;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQ_CODE = 1001;
    private static final String PREFS_NAME = "SmartCafePrefs";
    private static final String KEY_PERM_REQUESTED = "sc_permissions_requested_once";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                String existingUa = getBridge().getWebView().getSettings().getUserAgentString();
                getBridge().getWebView().getSettings().setUserAgentString(existingUa + " SmartCafeApp/2.0.0 (versionCode:2)");
            }
        } catch (Exception ignored) {}
        checkAndRequestAllPermissionsOnce();
    }

    private void checkAndRequestAllPermissionsOnce() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean alreadyRequested = prefs.getBoolean(KEY_PERM_REQUESTED, false);

        List<String> permissionsToRequest = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECEIVE_SMS);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.READ_SMS);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        // Request all ungranted permissions in a single batch on first launch
        if (!permissionsToRequest.isEmpty() && !alreadyRequested) {
            prefs.edit().putBoolean(KEY_PERM_REQUESTED, true).apply();
            ActivityCompat.requestPermissions(
                this,
                permissionsToRequest.toArray(new String[0]),
                PERMISSION_REQ_CODE
            );
        }
    }
}
