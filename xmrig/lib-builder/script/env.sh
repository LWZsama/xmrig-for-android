SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_BUILDER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

absolute_path() {
    if [[ "$1" = /* ]]; then
        printf '%s\n' "$1"
    else
        printf '%s\n' "$PWD/${1#./}"
    fi
}

if [ -n "${ANDROID_NDK_HOME:-}" ] && [ -d "$ANDROID_NDK_HOME" ]; then
    export ANDROID_NDK_ROOT="$ANDROID_NDK_HOME"
elif [ -n "${ANDROID_NDK_ROOT:-}" ] && [ -d "$ANDROID_NDK_ROOT" ]; then
    export ANDROID_NDK_HOME="$ANDROID_NDK_ROOT"
elif [ -d "${ANDROID_HOME:-}/ndk/r21e" ]; then
    export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/r21e"
    export ANDROID_NDK_ROOT="$ANDROID_NDK_HOME"
elif [ -d "${ANDROID_HOME:-}/ndk" ]; then
    NDK_VERSION=""
    for candidate in "${ANDROID_HOME}/ndk"/*; do
        [ -d "$candidate" ] || continue
        candidate_version="$(basename "$candidate")"
        case "$candidate_version" in
            27*) continue ;;
        esac
        NDK_VERSION="$candidate_version"
    done
    if [ -z "$NDK_VERSION" ]; then
        for candidate in "${ANDROID_HOME}/ndk"/*; do
            [ -d "$candidate" ] || continue
            NDK_VERSION="$(basename "$candidate")"
        done
    fi
    if [ -n "$NDK_VERSION" ]; then
        export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/${NDK_VERSION}"
        export ANDROID_NDK_ROOT="$ANDROID_NDK_HOME"
    fi
fi

if [ -z "${ANDROID_NDK_HOME:-}" ] || [ ! -d "$ANDROID_NDK_HOME" ]; then
    echo "Android NDK was not found. Set ANDROID_NDK_HOME or ANDROID_NDK_ROOT." >&2
    return 1
fi

export ANDROID_NDK_HOME="$(absolute_path "$ANDROID_NDK_HOME")"
export ANDROID_NDK_ROOT="$(absolute_path "$ANDROID_NDK_ROOT")"
export NDK_VERSION="$(basename "$ANDROID_NDK_HOME")"
export TOOLCHAINS_PATH="$(python3 "$LIB_BUILDER_DIR/script/toolchains_path.py" --ndk "$ANDROID_NDK_HOME")"

DEFAULT_EXTERNAL_LIBS_BUILD="$LIB_BUILDER_DIR/build"
EXTERNAL_LIBS_BUILD="${EXTERNAL_LIBS_BUILD:-$DEFAULT_EXTERNAL_LIBS_BUILD}"
export EXTERNAL_LIBS_BUILD="${EXTERNAL_LIBS_BUILD%/}"

DEFAULT_EXTERNAL_LIBS_BUILD_ROOT="$EXTERNAL_LIBS_BUILD/src"
EXTERNAL_LIBS_BUILD_ROOT="${EXTERNAL_LIBS_BUILD_ROOT:-$DEFAULT_EXTERNAL_LIBS_BUILD_ROOT}"
export EXTERNAL_LIBS_BUILD_ROOT="${EXTERNAL_LIBS_BUILD_ROOT%/}"

DEFAULT_EXTERNAL_LIBS_ROOT="$EXTERNAL_LIBS_BUILD/build"
EXTERNAL_LIBS_ROOT="${EXTERNAL_LIBS_ROOT:-$DEFAULT_EXTERNAL_LIBS_ROOT}"
export EXTERNAL_LIBS_ROOT="${EXTERNAL_LIBS_ROOT%/}"

DEFAULT_NDK_TOOL_DIR="$EXTERNAL_LIBS_BUILD/tool"
NDK_TOOL_DIR="${NDK_TOOL_DIR:-$DEFAULT_NDK_TOOL_DIR}"
export NDK_TOOL_DIR="${NDK_TOOL_DIR%/}"

if command -v ccache >/dev/null 2>&1; then
    export CMAKE_C_COMPILER_LAUNCHER=ccache
    export CMAKE_CXX_COMPILER_LAUNCHER=ccache
fi
