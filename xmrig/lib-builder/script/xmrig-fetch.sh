#!/usr/bin/env bash

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT

version="v6.26.0"

if [ ! -d "xmrig" ]; then
  git clone https://github.com/xmrig/xmrig.git -b ${version}
  cd ..
  cd ..
  patch -p1 -d build/src/xmrig < ./xmrig.patch --force
else
  cd xmrig
  git checkout ${version}
  git checkout -- .
  cd ..
  cd ..
  cd ..
  patch -p1 -d build/src/xmrig < ./xmrig.patch --force
fi
