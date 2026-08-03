#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

case "$EXTERNAL_LIBS_BUILD" in
    ""|"/"|"$LIB_BUILDER_DIR")
        echo "Refusing to remove unsafe build path: $EXTERNAL_LIBS_BUILD" >&2
        exit 1
        ;;
esac

rm -rf -- "$EXTERNAL_LIBS_BUILD"
mkdir -p "$EXTERNAL_LIBS_BUILD/src"
