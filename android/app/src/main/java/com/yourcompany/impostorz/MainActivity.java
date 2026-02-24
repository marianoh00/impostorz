package com.yourcompany.impostorz;

import android.os.Bundle;
import android.view.View;
import android.graphics.Color;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Ensure the window background is the game's deep-slate color to avoid a white flash
		try {
			getWindow().setBackgroundDrawableResource(android.R.color.background_dark);
		} catch (Exception e) { }

		// Also set the root view background color directly
		View root = findViewById(android.R.id.content);
		if (root != null) {
			try { root.setBackgroundColor(Color.parseColor("#020617")); } catch (Exception ignored) { }
		}

		// If Capacitor's WebView is available, force its background color immediately
		try {
			if (this.bridge != null && this.bridge.getWebView() != null) {
				this.bridge.getWebView().setBackgroundColor(Color.parseColor("#020617"));
			}
		} catch (Exception ignored) { }
	}
}
