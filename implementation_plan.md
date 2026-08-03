# XMRig for Android：自动观察与发布方案

## 目标

每天轻量检查 XMRig 和 MoneroOcean XMRig 的上游 tag。发现新版本后，通过 `repository_dispatch` 启动完整构建和 Release 流程。

当前仓库只保留两个 workflow：

- `Watch XMRig Release`：使用 `ubuntu-slim`，只执行 API/tag 检查；每天运行一次，也支持手动运行。
- `Build & Release`：只响应 `repository_dispatch` 或手动运行，不包含 cron/push 自动触发；负责更新版本、构建 native 库、签名 APK/AAB、持久化成功更新并创建 Release。

## Android 兼容性

应用使用 Android API 34 编译并 target API 34。项目原先 target API 31，在较新的 Android 设备上会被 Google Play Protect 判断为兼容性过低并显示“针对旧版 Android 开发”的安装提示。API 34 同时满足当前 Android 设备的兼容性阈值，并保留现有 React Native 0.68 构建工具链。

由于 Android 14 要求前台服务声明类型，XMRig 的长期运行服务声明为 `specialUse`，并在服务启动时传入对应类型；Android 13 及以上也声明并请求通知权限，以确保挖矿状态通知可见。

## Watch 流程

1. 查询官方 XMRig 最新 release 和 MoneroOcean 最新 tag。
2. 读取仓库当前两个 fetch 脚本中的版本。
3. 版本没有变化时结束，不启动重型 runner。
4. 版本变化时向本仓库发送 `xmrig-release-updated` `repository_dispatch`，payload 中包含两个上游 tag。

## Build & Release 流程

1. 读取 dispatch payload；手动运行时也可通过 workflow inputs 指定 tag。
2. 更新两个 fetch 脚本并递增应用 patch 版本。
3. 执行 `make all`，由 native fetch/build 脚本验证 patch 并构建四种 ABI。
4. 使用稳定 release keystore 构建签名 AAB 和 universal APK，验证两者签名。
5. 将版本文件、fetch 脚本和 native `.so` 产物提交回默认分支，提交信息包含 `[skip ci]`。
6. 使用当前版本创建 GitHub Release。

## 构建缓存

`Build & Release` 会分层复用可安全复用的构建状态：

- ccache 使用滚动前缀恢复、4 GiB 上限，并以编译器内容而不是文件时间判断工具链，覆盖四 ABI 的 C/C++ 编译。
- Gradle 使用官方增强缓存，复用 wrapper、依赖、编译脚本、transform 和本地 build cache。
- Yarn 同时缓存全局包缓存和按 `package.json`/`yarn.lock` 固定的 `node_modules`。
- native 依赖缓存按 NDK、构建脚本和依赖版本精确匹配；libUV/OpenSSL 产物不跨不兼容版本复用。
- upstream Git 元数据和 OpenSSL 源码压缩包单独缓存，减少重复 clone/download。

缓存只用于加速，不参与发布结果判断；任何缓存未命中时仍会从干净 runner 完整构建。workflow 会输出 cache hit 状态和 native ccache 统计，便于确认实际命中率。

Build workflow 没有 `push` 或 cron 触发，因此成功提交不会启动第二次 Build。若构建或发布失败，版本更新不会提交，下一次 Watch 仍会发现同一上游版本并再次尝试。

## 稳定签名配置

GitHub Actions 需要以下 secrets：

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

`ANDROID_KEYSTORE_BASE64` 必须对应长期保存的 release keystore，不能每次生成新 key，否则 APK 无法覆盖安装旧版本。

## 手动运行

在 Actions 页面手动运行 `Build & Release` 时，可以留空 inputs 使用仓库当前版本，也可以指定：

- `xmrig_version`，例如 `v6.26.0`
- `xmrig_mo_version`，例如 `v6.26.0-mo4`

本地 release 验证仍可使用 `-PallowUnsignedRelease=true`，但 unsigned 产物不能用于安装或升级。
