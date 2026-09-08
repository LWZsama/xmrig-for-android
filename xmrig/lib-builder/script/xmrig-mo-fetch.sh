#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

mkdir -p "$EXTERNAL_LIBS_BUILD_ROOT"
cd "$EXTERNAL_LIBS_BUILD_ROOT"

version="v6.26.0-mo5"
REPOSITORY="$EXTERNAL_LIBS_BUILD_ROOT/xmrig-mo"
PATCH_FILE="$SCRIPT_DIR/../xmrig-mo.patch"

if [ ! -d "$REPOSITORY/.git" ]; then
  rm -rf "$REPOSITORY"
  git clone --depth 1 --branch "$version" https://github.com/MoneroOcean/xmrig.git "$REPOSITORY"
else
  git -C "$REPOSITORY" fetch --tags origin "$version"
  git -C "$REPOSITORY" reset --hard "$version"
  git -C "$REPOSITORY" clean -fdx
fi

python3 - "$REPOSITORY/src/crypto/flex/flex_keccak.h" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()
macro = "#define flex_enc32le_aligned sph_enc32le_aligned\n"
if macro not in text:
    needle = '#include "../ghostrider/sph_types.h"\n'
    if needle not in text:
        raise SystemExit(f"compatibility include not found in {path}")
    text = text.replace(needle, needle + macro, 1)
    path.write_text(text)
if text.count(macro) != 1:
    raise SystemExit(f"compatibility macro count is not one in {path}")
PY

git -C "$REPOSITORY" apply --check --whitespace=error-all "$PATCH_FILE"
git -C "$REPOSITORY" apply "$PATCH_FILE"
