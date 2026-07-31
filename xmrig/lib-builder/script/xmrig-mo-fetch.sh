#!/usr/bin/env bash

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT

version="v6.26.0-mo4"

if [ ! -d "xmrig-mo" ]; then
  git clone https://github.com/MoneroOcean/xmrig.git -b ${version} xmrig-mo
  cd xmrig-mo
  sed -i 's/#include "\.\.\/ghostrider\/sph_types\.h"/#include "\.\.\/ghostrider\/sph_types\.h"\n#define flex_enc32le_aligned sph_enc32le_aligned/g' src/crypto/flex/flex_keccak.h
else
  cd xmrig-mo
  git checkout ${version}
  git checkout -- .
  sed -i 's/#include "\.\.\/ghostrider\/sph_types\.h"/#include "\.\.\/ghostrider\/sph_types\.h"\n#define flex_enc32le_aligned sph_enc32le_aligned/g' src/crypto/flex/flex_keccak.h
fi
