package com.xmrigforandroid;

import com.facebook.react.ReactActivity;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.WindowManager;

import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "XMRigForAndroid";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);  // here
    super.onCreate(null);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    IntentFilter batterFilters = new IntentFilter();
    batterFilters.addAction(Intent.ACTION_BATTERY_CHANGED);
    batterFilters.addAction(Intent.ACTION_BATTERY_LOW);
    batterFilters.addAction(Intent.ACTION_BATTERY_OKAY);
    batterFilters.addAction(Intent.ACTION_POWER_CONNECTED);
    batterFilters.addAction(Intent.ACTION_POWER_DISCONNECTED);
    registerReceiver(new PowerMonitorReceiver(), batterFilters);
  }
}
