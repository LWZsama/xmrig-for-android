#!/bin/bash

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT/libuv
mkdir build && cd build

TOOLCHAIN=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake
CMAKE=$(which cmake || echo $ANDROID_HOME/cmake/3.18.1/bin/cmake)
ANDROID_PLATFORM=android-29

#if [ ! -f "configure" ]; then
#  ./autogen.sh
#fi

archs=(arm arm64 x86 x86_64)
for arch in ${archs[@]}; do
    case ${arch} in
        "arm")
            target_host=arm-linux-androideabi
            ANDROID_ABI="armeabi-v7a"
            ;;
        "arm64")
            target_host=aarch64-linux-android
            ANDROID_ABI="arm64-v8a"
            ;;
        "x86")
            target_host=i686-linux-android
            ANDROID_ABI="x86"
            ;;
        "x86_64")
            target_host=x86_64-linux-android
            ANDROID_ABI="x86_64"
            ;;
        *)
            exit 16
            ;;
    esac

    mkdir -p $EXTERNAL_LIBS_BUILD_ROOT/libuv/build/$ANDROID_ABI
    cd $EXTERNAL_LIBS_BUILD_ROOT/libuv/build/$ANDROID_ABI
    
    TARGET_DIR=$EXTERNAL_LIBS_ROOT/libuv/$ANDROID_ABI

    if [ -f "$TARGET_DIR/lib/libuv.la" ]; then
      continue
    fi

    mkdir -p $TARGET_DIR
    echo "- Building for ${arch} (${ANDROID_ABI})"

    $CMAKE -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN \
        -DCMAKE_C_COMPILER_LAUNCHER=ccache \
        -DCMAKE_CXX_COMPILER_LAUNCHER=ccache \
        -DANDROID_ABI="$ANDROID_ABI" \
        -DANDROID_PLATFORM=$ANDROID_PLATFORM \
        -DCMAKE_INSTALL_PREFIX=$TARGET_DIR \
        -DBUILD_SHARED_LIBS=OFF \
        ../../ \
        && make -j 4 \
        && make install \
        && make clean

done

exit 0
