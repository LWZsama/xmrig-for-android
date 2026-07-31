#!/bin/bash

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT/hwloc


if [ ! -f "configure" ]; then
  ./autogen.sh
fi

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

    TARGET_DIR=$EXTERNAL_LIBS_ROOT/hwloc/$ANDROID_ABI

    if [ -f "$TARGET_DIR/lib/hwloc.la" ]; then
      continue
    fi

    mkdir -p $TARGET_DIR
    echo "building for ${arch}"

    PATH=$NDK_TOOL_DIR/$arch/$target_host/bin:$NDK_TOOL_DIR/$arch/bin:$TOOLCHAINS_PATH/bin:$PATH \
    CC=$TOOLCHAINS_PATH/bin/clang \
    CXX=$TOOLCHAINS_PATH/bin/clang++ \
    ./configure \
        --prefix=${TARGET_DIR} \
        --host=${target_host} \
        --enable-static \
        --disable-shared \
        && make -j 4 \
        && make install \
        && make clean

done

exit 0
