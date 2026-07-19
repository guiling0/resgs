# 04 — feat: trigger→UseSkillEvent 桥接

**What to build:** 在 `EventManager.trigger()` 中补齐触发技主循环——扫描可用效果后，按优先级逐人询问、创建 UseSkillEvent、执行、重试，直到无人可选。这是 M1 的核心交付。

**Blocked by:** 01 (maxTimes 字段), 02 (无消耗技能修复)

**Status:** ready-for-agent

- [ ] **执行循环**：while(true) 嵌套 priority→player，对每个玩家按优先级收集可用效果
- [ ] **askForSkillInvoke**：`forced='mute'`（锁定技）自动发动；`forced='cost'`（普通技）通过 `ChooseManager` 发起确认询问
- [ ] **UseSkillEvent 创建与执行**：确认后创建 `UseSkillEvent` → `exec()` → choose/cost/effect 管线
- [ ] **同优先级重试**：技能发动后同一玩家同优先级允许再次检测（continue 回到同层循环）
- [ ] **times 计数**：按 `playerId + effectId` 记录发动次数，与 `maxTimes` 联动
- [ ] **时机结束信号**：`EffectContext.endTiming` → 技能效果可声明"此时机结束"，跳出循环
- [ ] **A2 接口预留**：UseSkillEvent 明置步骤改为调用 ChangeStateEvent(open) 的接口预留（完整实现在 M3）
- [ ] `shared/test/m1-trigger-bridge.test.ts` 新增 6 个测试用例：
  1. 锁定技自动发动（无需 mock 输入）
  2. 普通技 mock 确认后发动
  3. 普通技 mock 拒绝后不发动
  4. maxTimes=1 同回合第二次伤害不触发
  5. 3 人局逆时针响应顺序
  6. 多优先级（武将技 vs 装备技）顺序
