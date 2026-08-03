# 当前 workflow 说明

本次清理后，仓库只保留 `Watch XMRig Release` 和 `Build & Release` 两个 GitHub Actions workflow。

## Android 兼容性

- Android 工程现在使用 `compileSdkVersion/targetSdkVersion 34`，避免新 Android 设备上的 Play Protect 旧目标 API 提示。
- XMRig 前台服务声明为 Android 14 要求的 `specialUse` 类型，并传入对应的运行时服务类型。
- Android 13 及以上会请求 `POST_NOTIFICATIONS`，保证前台挖矿状态通知能够显示。

## Watch XMRig Release

- Runner：`ubuntu-slim`，适合只做版本观察的轻量任务。
- 触发：每天一次的 schedule，以及手动 `workflow_dispatch`。
- 不 checkout 仓库、不安装 Node/NDK/JDK，只读取当前 fetch 脚本并查询上游 tag。
- 发现 XMRig 或 XMRig-MO 更新时，向当前仓库发送 `xmrig-release-updated` `repository_dispatch`。

## Build & Release

- 触发：`repository_dispatch` 或手动 `workflow_dispatch`；没有 cron，也没有 push 触发。
- 使用 `ubuntu-latest` 执行完整 native 和 Android 构建。
- dispatch payload 传入的上游版本会写入 fetch 脚本，并递增应用 patch 版本。
- 构建成功后持久化版本、四 ABI native `.so` 和版本同步文件，提交信息包含 `[skip ci]`。
- 使用稳定 keystore 签名 AAB/APK，验证签名后创建 GitHub Release。
- 构建前会检查应用版本对应的 release tag；如果 tag 已存在，会自动递增 patch 版本后再构建，避免浪费 native/Gradle 构建时间。Release 阶段仍保留一次最终冲突检查，防止并发情况下覆盖已有 tag。

## 缓存策略

- ccache 使用带时间戳的滚动缓存，并通过 `restore-keys` 恢复最近一次结果；`CCACHE_COMPILERCHECK=content` 避免 hosted runner 上工具链文件时间变化导致无谓 miss。
- Gradle 使用官方增强缓存，并开启 `org.gradle.caching=true`；Node/Yarn 使用 setup-node 的 Yarn 缓存和单独的 `node_modules` 缓存。
- native 依赖的 libUV/OpenSSL 产物按 NDK 与构建脚本精确缓存；OpenSSL 通过版本、NDK、编译选项完成标记确认后才跳过重复构建。
- workflow 会记录 native source/dependency cache 状态、Node modules 命中状态以及 native ccache 统计；日志中的 `cache-hit: true` 表示精确命中，`false` 表示通过恢复前缀命中。

## 失败行为

如果 patch、native、Gradle、签名或 Release 任一步骤失败，成功更新不会提交。Watch 下一次运行时仍会发现上游版本与仓库不一致，从而再次触发 Build & Release。

本机若没有 Java、Android SDK/NDK、CMake、Node/Yarn，只能完成 workflow/YAML/shell 静态检查；完整 APK 构建由 `Build & Release` runner 执行。
