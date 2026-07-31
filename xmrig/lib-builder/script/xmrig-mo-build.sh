#!/bin/bash

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT/xmrig-mo
sed -e "s/pthread rt dl log/dl/g" CMakeLists.txt > TempCMakeLists.txt
rm -f CMakeLists.txt
mv TempCMakeLists.txt CMakeLists.txt
mkdir build && cd build

TOOLCHAIN=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake
CMAKE=$(which cmake || echo $ANDROID_HOME/cmake/3.18.1/bin/cmake)
ANDROID_PLATFORM=android-29

archs=(arm arm64 x86 x86_64)
for arch in ${archs[@]}; do
    case ${arch} in
        "arm")
            target_host=arm-linux-androideabi
            ANDROID_ABI="armeabi-v7a"
            ARM_TARGET=7
            ;;
        "arm64")
            target_host=aarch64-linux-android
            ANDROID_ABI="arm64-v8a"
            ARM_TARGET=8
            ;;
        "x86")
            target_host=i686-linux-android
            ANDROID_ABI="x86"
            ARM_TARGET=0
            ;;
        "x86_64")
            target_host=x86_64-linux-android
            ANDROID_ABI="x86_64"
            ARM_TARGET=0
            ;;
        *)
            exit 16
            ;;
    esac

    mkdir -p $EXTERNAL_LIBS_BUILD_ROOT/xmrig-mo/build/$ANDROID_ABI
    cd $EXTERNAL_LIBS_BUILD_ROOT/xmrig-mo/build/$ANDROID_ABI

    TARGET_DIR=$EXTERNAL_LIBS_ROOT/xmrig-mo/$ANDROID_ABI


    #if [ -f "$TARGET_DIR/lib/xmrig" ]; then
    #  continue
    #fi

    mkdir -p $TARGET_DIR
    echo "building for ${arch} in ${TARGET_DIR}"

    $CMAKE -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN \
        -DCMAKE_C_COMPILER_LAUNCHER=ccache \
        -DCMAKE_CXX_COMPILER_LAUNCHER=ccache \
        -DANDROID_ABI="$ANDROID_ABI" \
        -DANDROID_PLATFORM=$ANDROID_PLATFORM \
        -DCMAKE_INSTALL_PREFIX:PATH=$TARGET_DIR \
        -DANDROID_CROSS_COMPILE=ON \
        -DBUILD_SHARED_LIBS=OFF \
        -DWITH_OPENCL=OFF \
        -DWITH_CUDA=OFF \
        -DBUILD_STATIC=OFF \
        -DWITH_TLS=ON \
        -DWITH_HWLOC=OFF \
        -DUV_LIBRARY="$EXTERNAL_LIBS_ROOT/libuv/$ANDROID_ABI/lib/libuv_a.a" \
        -DUV_INCLUDE_DIR="$EXTERNAL_LIBS_ROOT/libuv/$ANDROID_ABI/include" \
        -DOPENSSL_SSL_LIBRARY="$EXTERNAL_LIBS_ROOT/openssl/$ANDROID_ABI/lib/libssl.a" \
        -DOPENSSL_CRYPTO_LIBRARY="$EXTERNAL_LIBS_ROOT/openssl/$ANDROID_ABI/lib/libcrypto.a" \
        -DOPENSSL_INCLUDE_DIR="$EXTERNAL_LIBS_ROOT/openssl/$ANDROID_ABI/include" \
        ../../ && make -j 4  && make install && make clean

done

exit 0
