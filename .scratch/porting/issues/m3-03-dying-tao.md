# M3-03 — 濒死求桃闭环

**What to build:** 注册桃 CardUse（Dying 时机，目标是濒死角色）。Dying trigger 自动发现桃并轮询全场，出桃后回复体力脱离濒死，无人救则死亡。

**Blocked by:** M3-02

**Status:** ready-for-agent

- [x] 桃 CardUse 注册：`{ name: 'tao', timing: Dying, target: [dyingPlayer], canUse: 仅在 Dying 事件栈中 }`
- [x] Dying trigger → needUseCard 自动发现桃 → 按座次轮询全场
- [x] 有人出桃 → UseCardEvent → 回复体力 → 脱离濒死
- [x] 无人救 → 死亡流程
- [x] 验证：出杀→伤害→濒死→出桃救回（hp=1）
- [x] 验证：出杀→伤害→濒死→全场取消→死亡
- [x] M2 杀/桃 + M3-02 闪验收测试无回归
