# Third-party notices

This repository packages and builds third-party native code. The notices below identify the main components and their pinned source locations; the upstream repositories contain the complete license texts.

## XMRig

- Source: https://github.com/xmrig/xmrig
- Pinned version: `v6.26.0`
- License: GNU General Public License v3.0 or later, as specified by the upstream project.
- Local changes: `xmrig/lib-builder/xmrig.patch` disables the upstream donation strategy for this application.

## MoneroOcean XMRig

- Source: https://github.com/MoneroOcean/xmrig
- Pinned version: `v6.26.0-mo4`
- License: GNU General Public License v3.0 or later, as specified by the upstream project.
- Local changes: `xmrig/lib-builder/xmrig-mo.patch` disables the upstream donation strategy; `xmrig/lib-builder/script/xmrig-mo-fetch.sh` also adds the `flex_enc32le_aligned` compatibility alias.

## Other native dependencies

- OpenSSL is built from the pinned `1.1.1w` source archive.
- libuv is built from tag `v1.43.0`.
- HWLOC is not included in the Android `make all` build; the CMake configuration uses `-DWITH_HWLOC=OFF`.

When distributing an APK, retain the applicable upstream notices and provide corresponding source or a written offer as required by the upstream licenses.
