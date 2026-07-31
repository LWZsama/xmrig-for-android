# Build XMRig for Android

## Prerequisites
* NodeJS v17.1.0
* [React Native Development Enviroment](https://reactnative.dev/docs/environment-setup)
* Android Studio
* Android 10 SDK 29
* Android SDK Build Tools 29.0.2
* Android NDK 23.0.7599858
* Android SDK Command-line Tools 5.0
* Android SDK Platform-Tools 31.0.3
* CMake

## Build XMRig
This script will compile hwloc, libuv and xmrig for each ABI. The execuable will be copied to `jniLibs` folder in android project.
```
cd xmrig/lib-builder
make install
```


## Build
Clone the repo

`yarn install`

Start meteor server
`yarn start`

If you use nvm - open Android Studio from terminal after running `nvm use`.

Run Android Emulator
`npx react-native run-android`