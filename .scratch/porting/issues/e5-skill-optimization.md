# E5 — sgs-extension skill 优化

**What to build:** 优化 `.claude/skills/sgs-extension/` skill，使其符合扩展系统编写流程——隔离环境（通过 `sgs.xxx` 而非 `import`）、Builder API 指引、扩展元数据规范、发布流程。

**Blocked by:** E4

**Status:** ready-for-agent

- [ ] skill 指引更新：扩展隔离——通过 `sgs.SkillBuilder` 而非 `import { SkillBuilder }`
- [ ] skill 指引更新：扩展元数据 JSDoc 格式（`@name/@description/@author/@version`）
- [ ] skill 指引更新：扩展文件结构约定（`index.ts` + `generals/` + `skills/` + `cards/` + `modes/`）
- [ ] skill 指引更新：`.register()` 幂等约束
- [ ] skill 指引更新：发布流程——`build-extension` + `publish-extension`
- [ ] skill 指引更新：资源路径约定（`{cdn}/generals/{baseUrl}/{file}`）
- [ ] skill 指引更新：代码/数据分离——官方扩展可拆分 `xxx` + `xxx-data`
- [ ] 验证：用 skill 指引从零编写一个武将扩展，能正确注册
