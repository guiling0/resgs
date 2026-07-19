# ⚖️ 裁定记录（全部已裁定 2026-07-18）

> 事件口述阶段的全部争议项已由用户统一裁定。结果已分发至对应权威文档；涉及代码的变更**暂不执行**（用户指示），已在 [pending-impl.md](pending-impl.md) 的"裁定落实待办"块中登记。

| 编号 | 议题 | 裁定结果 | 分发落点 |
|---|---|---|---|
| R1 | `GameStartAfter` 枚举缺失 | **需要增加**（标记待补） | turn.md、pending-impl |
| R2 | UseSkillEvent 明置实现 | **现实现不对**。应参照旧项目用 open 方法调用 ChangeStateEvent：事件内部修改属性 + 规则技能提供势力确定 + 注册 deferredOpens；drain 处遍历**直接触发明置后时机** | use-skill.md、change-state.md、pending-impl |
| R3 | `PindianCardShow` 保留 | **确认保留**（拼点亮出由状态改变事件移入拼点事件） | pindian.md、change-state.md |
| R4 | 牌状态改变前❶/❷ | 规则中❶❷区分不同状态类型；实现中**可通过数据类型判断**故合并为一个"牌状态改变前"时机（`ChangeState`），不扩枚举 | change-state.md |
| R5 | `JudgeResult1/2` | **保留双时机**：1=改判（**替换判定牌**）；2=改结果（**不替换判定牌**）。使用 2 的技能在现规则版本不存在，后续会有 | judge.md |
| R6 | 枚举多余成员 | **全部保留**——新增时机均有用（规则集未收录的武将技能可能用到）。`RecoverHp`（回复体力时）保留；`DeathBefore`（死亡前）与 `DeathConfirmRole`（确认身份前）均保留 | hp-events.md、dying-death.md |
| R7 | 伤害六要素 | **渠道（牌或技能）、属性、来源、受伤角色、伤害值、是否为连环伤害**——均已实现 | damage.md |
| R8 | 空闲时间点 | **拆分为独立的时机枚举成员**（不用无限循环 play_phase 模型） | phase.md、pending-impl |
