#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

cd "$EXTERNAL_LIBS_BUILD_ROOT/openssl"
#mkdir build && cd build

if command -v ccache >/dev/null 2>&1; then
    export CC="ccache clang"
else
    export CC=clang
fi
export PATH="$TOOLCHAINS_PATH/bin:$PATH"
ANDROID_API=29
OPENSSL_VERSION="$(cat .xmrig-version 2>/dev/null || true)"
BUILD_MARKER="$EXTERNAL_LIBS_ROOT/openssl/.xmrig-build-complete"
EXPECTED_MARKER="${OPENSSL_VERSION}|${NDK_VERSION}|android-api-${ANDROID_API}|no-asm|no-zlib|no-comp|no-dgram|no-filenames|no-cms"

if [ -f "$BUILD_MARKER" ] && [ "$(cat "$BUILD_MARKER")" = "$EXPECTED_MARKER" ]; then
    cache_complete=1
    for abi in armeabi-v7a arm64-v8a x86 x86_64; do
        if [ ! -s "$EXTERNAL_LIBS_ROOT/openssl/$abi/lib/libssl.a" ] || \
           [ ! -s "$EXTERNAL_LIBS_ROOT/openssl/$abi/lib/libcrypto.a" ]; then
            cache_complete=0
            break
        fi
    done
    if [ "$cache_complete" -eq 1 ]; then
        echo "OpenSSL artifacts are already cached for $EXPECTED_MARKER."
        exit 0
    fi
fi

archs=(arm arm64 x86 x86_64)
for arch in "${archs[@]}"; do
    case ${arch} in
        "arm")
            architecture=android-arm
            ANDROID_ABI="armeabi-v7a"
            ;;
        "arm64")
            architecture=android-arm64
            ANDROID_ABI="arm64-v8a"
            ;;
        "x86")
            architecture=android-x86
            ANDROID_ABI="x86"
            ;;
        "x86_64")
            architecture=android-x86_64
            ANDROID_ABI="x86_64"
            ;;
        *)
            exit 16
            ;;
    esac

    TARGET_DIR="$EXTERNAL_LIBS_ROOT/openssl/$ANDROID_ABI"

    if [ -s "$TARGET_DIR/lib/libssl.a" ] && [ -s "$TARGET_DIR/lib/libcrypto.a" ]; then
        echo "OpenSSL artifacts already exist for ${ANDROID_ABI}."
        continue
    fi

    mkdir -p "$TARGET_DIR"
    echo "building for ${arch}"

    if [ -f Makefile ]; then
        make distclean >/dev/null 2>&1 || true
    fi

    ./Configure "$architecture" -D__ANDROID_API__="$ANDROID_API" --prefix="$TARGET_DIR" \
        -no-shared -no-asm -no-zlib -no-comp -no-dgram -no-filenames -no-cms

    make -j 4 build_libs
    make install_dev
    make distclean >/dev/null 2>&1 || true

done

mkdir -p "$(dirname "$BUILD_MARKER")"
printf '%s\n' "$EXPECTED_MARKER" > "$BUILD_MARKER"

exit 0
