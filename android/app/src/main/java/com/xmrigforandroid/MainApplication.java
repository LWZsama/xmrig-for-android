package com.xmrigforandroid;

import android.app.Application;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import com.facebook.react.bridge.JSIModulePackage;
import com.swmansion.reanimated.ReanimatedJSIModulePackage;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new XMRigForAndroidPackage());
          //packages.add(new RNCWebViewPackage());
          //  packages.add(new SplashScreenReactPackage());
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());

          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

      @Override
      protected JSIModulePackage getJSIModulePackage() {
          return new ReanimatedJSIModulePackage();
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

    // ACTION_BATTERY_CHANGED is a sticky broadcast and must be registered at runtime.
    // Register it once for the application lifetime instead of once per Activity.
    registerReceiver(new PowerMonitorReceiver(), new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
  }
}
