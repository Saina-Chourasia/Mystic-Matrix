package com.mysticmatrix.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            // Configure WebView settings for modern OAuth compatibility and performance
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebSettings settings = this.bridge.getWebView().getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(true);
                
                // Remove WebView signature to allow secure Google OAuth inside Capacitor
                String defaultUserAgent = settings.getUserAgentString();
                if (defaultUserAgent != null) {
                    String cleanedUserAgent = defaultUserAgent
                        .replace("; wv", "")
                        .replaceAll("Version\\/\\d+\\.\\d+\\s?", "");
                    settings.setUserAgentString(cleanedUserAgent);
                }
            }
        } catch (Exception e) {
            // Non-fatal fallback
        }
    }
}
