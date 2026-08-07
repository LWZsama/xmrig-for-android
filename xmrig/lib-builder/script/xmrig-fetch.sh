#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

mkdir -p "$EXTERNAL_LIBS_BUILD_ROOT"
cd "$EXTERNAL_LIBS_BUILD_ROOT"

version="v6.26.0"
REPOSITORY="$EXTERNAL_LIBS_BUILD_ROOT/xmrig"
PATCH_FILE="$SCRIPT_DIR/../xmrig.patch"

if [ ! -d "$REPOSITORY/.git" ]; then
  rm -rf "$REPOSITORY"
  git clone --depth 1 --branch "$version" https://github.com/xmrig/xmrig.git "$REPOSITORY"
else
  git -C "$REPOSITORY" fetch --tags origin "$version"
  git -C "$REPOSITORY" reset --hard "$version"
  git -C "$REPOSITORY" clean -fdx
fi

git -C "$REPOSITORY" apply --check --whitespace=error-all "$PATCH_FILE"
git -C "$REPOSITORY" apply "$PATCH_FILE"
