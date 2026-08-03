# Build XMRig for Android

## Prerequisites

* JDK 17
* Node.js 20 and Yarn
* Python 3 with `setuptools`
* Android SDK Platform/Build Tools 34
* Android NDK `r21e` (`21.4.7075529`)
* CMake and GNU Make
* [React Native Development Environment](https://reactnative.dev/docs/environment-setup)

The GitHub Actions workflows install these versions explicitly. `ccache` is optional and only accelerates native rebuilds.

## Build XMRig
This script will compile libuv, OpenSSL, XMRig and XMRig-MO for each ABI. HWLOC is disabled for Android and is not part of `make all`. The executables are copied to the `jniLibs` folder in the Android project.
```
cd xmrig/lib-builder
make all
```


## Build
Clone the repo

`yarn install --frozen-lockfile`

Start meteor server
`yarn start`

If you use nvm - open Android Studio from terminal after running `nvm use`.

Run Android Emulator
`npx react-native run-android`

## Release signing

Debug builds use the normal local debug key. Release builds intentionally fail unless a stable release keystore is supplied. Pass these Gradle properties locally or configure the equivalent GitHub Actions secrets:

* `MYAPP_UPLOAD_STORE_FILE`
* `MYAPP_UPLOAD_STORE_PASSWORD`
* `MYAPP_UPLOAD_KEY_ALIAS`
* `MYAPP_UPLOAD_KEY_PASSWORD`

For a local validation-only release bundle, use `-PallowUnsignedRelease=true`; that output is not suitable for installation or updates.
