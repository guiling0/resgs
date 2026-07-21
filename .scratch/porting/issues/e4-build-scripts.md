# E4 — 构建脚本 + 模板仓库初始化

**What to build:** 4 个构建脚本（types / registry / extension bundle）。初始化 `extension/resgs-ext-temp/` 为模板仓库——包含 `.d.ts`、`.agent/`、示例文件、构建脚本。

**Blocked by:** E2, E3

**Status:** ✅ completed

- [x] `scripts/build-types.ts`：`tsc --declaration` 生成 `.d.ts` → 输出到 `extension/resgs-ext-temp/types/`
- [x] `scripts/build-registry.ts`：扫描 `extension/*/index.ts` → 生成 `extension/registry.ts`（自动 re-export）
- [x] `scripts/build-extension.ts <name>`：rollup 打包单个扩展为 IIFE → 输出 `extension/<name>/dist/<name>.js`
- [x] `scripts/publish-extension.ts <name>`：上传 assets 到 CDN 骨架（阿里云 CLI，TODO 标记第三方方案）
- [x] `.agent/` 文件夹：`CLAUDE.md`（Builder API 参考 + 扩展编写规范）、`skill.md`（扩展编写 skill 定义）、`knowledge/`（技能范例目录）、`issues/`（AI 工单目录）
- [x] 模板仓库 `extension/resgs-ext-temp/` 包含完整示例：武将 + 技能 + 卡牌 + 模式 Builder 用法
- [x] 验证：`npm run build-types` 产出 `.d.ts`；`build-registry` 生成 `registry.ts`
