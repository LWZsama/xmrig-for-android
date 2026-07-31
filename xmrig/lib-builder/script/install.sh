#!/bin/bash

set -e

source script/env.sh

archs=(arm arm64 x86 x86_64)

for arch in ${archs[@]}; do
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

	ROOT_DIR=`pwd`/../../
	XMRIG_DIR=`pwd`/build/src/xmrig/build/$xarch
    XMRIG_MO_DIR=`pwd`/build/src/xmrig-mo/build/$xarch

	rm -Rf $ROOT_DIR/android/app/src/main/jniLibs/$xarch/*
	cp $XMRIG_DIR/xmrig $ROOT_DIR/android/app/src/main/jniLibs/$xarch/libxmrig.so
    cp $XMRIG_MO_DIR/xmrig $ROOT_DIR/android/app/src/main/jniLibs/$xarch/libxmrig-mo.so

done
exit 0

