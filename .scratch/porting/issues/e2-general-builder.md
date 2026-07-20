# E2 — GeneralBuilder + 最简扩展验证

**What to build:** `GeneralBuilder` 创建武将并注册到 `sgs.generals`。在 `extension/resgs-ext-temp/` 下创建最简测试扩展验证端到端——导入扩展 → 武将在 `sgs.generals` 中可用。

**Blocked by:** E1

**Status:** ready-for-agent

- [ ] `GeneralBuilder` 类：`.name()`、`.kingdom()`、`.hp()`、`.gender()`、`.skills()`、`.lord()`、`.register()` → 写入 `sgs.generals`
- [ ] `.register()` 幂等——重复调用不重复注册
- [ ] `registerCore` 中暴露 `GeneralBuilder`
- [ ] 创建 `extension/resgs-ext-temp/index.ts`：JSDoc 元数据 + `export const meta`
- [ ] 创建 `extension/resgs-ext-temp/generals/caocao.ts`：`new GeneralBuilder('caocao').hp(4).skills(['jianxiong']).register()`
- [ ] 创建 `extension/resgs-ext-temp/generals/jianxiong.ts`：`new SkillBuilder('jianxiong').register()`
- [ ] 服务端 `import '../extension/resgs-ext-temp'` → `sgs.generals.has('caocao')` 为 true
- [ ] 现有测试无回归
