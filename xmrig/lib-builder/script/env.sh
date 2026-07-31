realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

if [ -n "$ANDROID_NDK_HOME" ] && [ -d "$ANDROID_NDK_HOME" ]; then
    export ANDROID_NDK_ROOT="$ANDROID_NDK_HOME"
    export NDK_VERSION=$(basename "$ANDROID_NDK_HOME")
elif [ -n "$ANDROID_NDK_ROOT" ] && [ -d "$ANDROID_NDK_ROOT" ]; then
    export ANDROID_NDK_HOME="$ANDROID_NDK_ROOT"
    export NDK_VERSION=$(basename "$ANDROID_NDK_ROOT")
elif [ -d "${ANDROID_HOME}/ndk/r21e" ]; then
    export NDK_VERSION="r21e"
    export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/r21e"
    export ANDROID_NDK_ROOT="${ANDROID_HOME}/ndk/r21e"
elif [ -d "${ANDROID_HOME}/ndk" ]; then
    export NDK_VERSION=$(ls -1 "${ANDROID_HOME}/ndk" | grep -v "^27" | tail -n 1 || ls -1 "${ANDROID_HOME}/ndk" | tail -n 1)
    export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/${NDK_VERSION}"
    export ANDROID_NDK_ROOT="${ANDROID_HOME}/ndk/${NDK_VERSION}"
fi

export ANDROID_NDK_ROOT=`realpath $ANDROID_NDK_ROOT`
export ANDROID_NDK_HOME=`realpath $ANDROID_NDK_HOME`
export TOOLCHAINS_PATH=$(python3 script/toolchains_path.py --ndk ${ANDROID_NDK_HOME})

DEFAULT_EXTERNAL_LIBS_BUILD=`pwd`/build/
EXTERNAL_LIBS_BUILD="${EXTERNAL_LIBS_BUILD:-${DEFAULT_EXTERNAL_LIBS_BUILD}}"
export EXTERNAL_LIBS_BUILD=${EXTERNAL_LIBS_BUILD%/}

DEFAULT_EXTERNAL_LIBS_BUILD_ROOT=${EXTERNAL_LIBS_BUILD}/src/
EXTERNAL_LIBS_BUILD_ROOT="${EXTERNAL_LIBS_BUILD_ROOT:-${DEFAULT_EXTERNAL_LIBS_BUILD_ROOT}}"
export EXTERNAL_LIBS_BUILD_ROOT=${EXTERNAL_LIBS_BUILD_ROOT%/}

DEFAULT_EXTERNAL_LIBS_ROOT=${EXTERNAL_LIBS_BUILD}/build/
EXTERNAL_LIBS_ROOT="${EXTERNAL_LIBS_ROOT:-${DEFAULT_EXTERNAL_LIBS_ROOT}}"
export EXTERNAL_LIBS_ROOT=${EXTERNAL_LIBS_ROOT%/}

DEFAULT_NDK_TOOL_DIR=${EXTERNAL_LIBS_BUILD}/tool/
NDK_TOOL_DIR="${NDK_TOOL_DIR:-${DEFAULT_NDK_TOOL_DIR}}"
export NDK_TOOL_DIR=${NDK_TOOL_DIR%/}

if command -v ccache >/dev/null 2>&1; then
    export PATH="/usr/lib/ccache:/usr/local/opt/ccache/libexec:$PATH"
    export CMAKE_C_COMPILER_LAUNCHER=ccache
    export CMAKE_CXX_COMPILER_LAUNCHER=ccache
fi
