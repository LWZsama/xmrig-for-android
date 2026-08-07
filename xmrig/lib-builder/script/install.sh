#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

PROJECT_ROOT="$(cd "$LIB_BUILDER_DIR/../.." && pwd)"
JNI_LIBS_DIR="$PROJECT_ROOT/android/app/src/main/jniLibs"

archs=(arm arm64 x86 x86_64)

for arch in "${archs[@]}"; do
    case ${arch} in
        "arm")
			xarch="armeabi-v7a"
			;;
        "arm64")
			xarch="arm64-v8a"
            ;;
        "x86")
			xarch="x86"
            ;;
        "x86_64")
			xarch="x86_64"
            ;;
        *)
			exit 16
            ;;
    esac

    XMRIG_BINARY="$EXTERNAL_LIBS_BUILD_ROOT/xmrig/build/$xarch/xmrig"
    XMRIG_MO_BINARY="$EXTERNAL_LIBS_BUILD_ROOT/xmrig-mo/build/$xarch/xmrig"
    DEST_DIR="$JNI_LIBS_DIR/$xarch"

    test -f "$XMRIG_BINARY"
    test -f "$XMRIG_MO_BINARY"
    mkdir -p "$DEST_DIR"
    rm -f "$DEST_DIR/libxmrig.so" "$DEST_DIR/libxmrig-mo.so"
    install -m 0755 "$XMRIG_BINARY" "$DEST_DIR/libxmrig.so"
    install -m 0755 "$XMRIG_MO_BINARY" "$DEST_DIR/libxmrig-mo.so"

done
exit 0
