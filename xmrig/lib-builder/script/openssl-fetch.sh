#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

mkdir -p "$EXTERNAL_LIBS_BUILD_ROOT"
cd "$EXTERNAL_LIBS_BUILD_ROOT"

OPENSSL_VERSION="1.1.1w"
OPENSSL_ARCHIVE="openssl-${OPENSSL_VERSION}.tar.gz"

if [ ! -d "openssl" ] || [ "$(cat openssl/.xmrig-version 2>/dev/null || true)" != "$OPENSSL_VERSION" ]; then
  rm -rf openssl
  if [ ! -f "$OPENSSL_ARCHIVE" ]; then
    curl --fail --location --retry 3 \
      "https://www.openssl.org/source/${OPENSSL_ARCHIVE}" \
      -o "$OPENSSL_ARCHIVE"
  fi
  tar -xzf "$OPENSSL_ARCHIVE"
  mv "openssl-${OPENSSL_VERSION}" openssl
  printf '%s\n' "$OPENSSL_VERSION" > openssl/.xmrig-version
fi
