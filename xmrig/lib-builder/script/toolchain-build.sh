#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

archs=(arm arm64 x86 x86_64)

for arch in "${archs[@]}"; do
    mkdir -p "$NDK_TOOL_DIR/$arch"
    if [ ! -e "$NDK_TOOL_DIR/$arch/bin" ]; then
        ln -sf "$TOOLCHAINS_PATH/bin" "$NDK_TOOL_DIR/$arch/bin"
    fi
    if [ ! -e "$NDK_TOOL_DIR/$arch/sysroot" ] && [ -d "$TOOLCHAINS_PATH/sysroot" ]; then
        ln -sf "$TOOLCHAINS_PATH/sysroot" "$NDK_TOOL_DIR/$arch/sysroot"
    fi
    case ${arch} in
        "arm") target_host="arm-linux-androideabi" ;;
        "arm64") target_host="aarch64-linux-android" ;;
        "x86") target_host="i686-linux-android" ;;
        "x86_64") target_host="x86_64-linux-android" ;;
    esac
    if [ ! -e "$NDK_TOOL_DIR/$arch/$target_host" ]; then
        if [ -d "$TOOLCHAINS_PATH/$target_host" ]; then
            ln -sf "$TOOLCHAINS_PATH/$target_host" "$NDK_TOOL_DIR/$arch/$target_host"
        else
            ln -sf "$TOOLCHAINS_PATH" "$NDK_TOOL_DIR/$arch/$target_host"
        fi
    fi
done
