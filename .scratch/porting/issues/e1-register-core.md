# E1 — registerCore + sgs 全局暴露

**What to build:** 创建 `shared/core/register.ts`，将全部枚举和 Builder 类一次性挂载到 `sgs` 全局对象。扩展通过 `sgs.TimingName.DamageStart` 访问运行时值，无需 import 核心模块。

**Blocked by:** None — 可立即开始

**Status:** ready-for-agent

- [ ] 创建 `shared/core/register.ts`：`registerCore(sgs)` 函数，`Object.assign` 全部枚举 + Builder 类
- [ ] 暴露枚举：`TimingName`、`EventType`、`DamageType`、`PriorityType`、`SkillTag`、`StateEffectType`、`CardType`、`CardSubType`、`AreaType`、`Gender` 等
- [ ] 暴露 Builder：`SkillBuilder`、`EffectBuilder`
- [ ] `sgs.init()` 中调用 `registerCore(this)`
- [ ] 验证：`sgs.TimingName.DamageStart === 'damage_start'`（TypeScript + 运行时均可用）
- [ ] 现有测试无回归
