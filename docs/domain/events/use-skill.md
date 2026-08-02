# 技能使用事件（UseSkillEvent）

> 领域权威定义。来源：用户口述（2026-07-18）。实现参照 `shared/core/event/UseSkillEvent.ts`（新）与旧项目 `event/types/event.skill.ts`。
> 技能的分类、六要素、发动判定点见 [skill.md](../definitions/skill.md)。

---

## 定义

使用一个触发类技能的方法：角色在此技能的**发动时机**、若满足此技能的**发动条件**（若有），则（可）**声明此技能名**，**同时**选择此技能的**目标**（若有），并**同时**执行发动技能的**所有消耗**（若有）——**若其中的一个消耗不能执行，其不能发动此技能且不能执行其他消耗**——当所有的消耗执行完毕，该角色即**发动了技能**，须依次执行技能的**各个能执行的效果**（即进行**技能的使用结算**）。

要点：

1. **（可）**：括号中的"可"对应非强制发动的技能（锁定技/强制技无"可"，见 [description.md](../terms/description.md) 的"可"）
2. **同时性**：声明技能名、选择目标、执行消耗的选择在**同一次询问**中同时完成（实现：skill_cost 选择器随发动询问一并下发）
3. **消耗原子性**：任一消耗不能执行 → 不能发动 + 其他消耗也不执行（全有或全无）。
   > 澄清（用户裁定 2026-07-18）：定义中"所有消耗/其中的一个消耗"为规则集通用行文（"所有"可指一个），消耗仍**严格为单个操作**（见 [skill.md](../definitions/skill.md) 六要素）；原子性条款在单消耗下天然成立。
4. **发动判定点**：所有消耗执行完毕即"发动了技能"（与 [skill.md](../definitions/skill.md) 有消耗流程一致）
5. **效果过滤**：只依次执行"各个**能执行的**"效果——不能执行的效果跳过，不阻断后续效果

## 实现映射

### 新项目 `UseSkillEvent.exec()` 流程

| 步骤 | 内容 | 状态 |
|---|---|---|
| init | `context.event` 注入 + `_currentEffect` 嵌套栈 push | ✅ |
| 1 | 排序目标（`settings.sort !== false` 时 sortResponse） | ✅ |
| 2 | 执行 `choose` 回调（返回 falsy → 终止，不发动） | ✅ |
| 3 | 明置武将牌（非 Secret 标签，head/deputy `turnTo(true)`） | ⚠️ 见下 |
| 4 | 记录历史（insertHistory） | ✅ |
| 5-11 | 动画/配音/战报/指向线/阵法/化身 | TODO 通讯模块 |
| 8/9 | 限定技/觉醒技标记（`@limit`/`@awake`） | ✅ |
| 13 | 执行 `cost` 回调 → falsy 则不发动 → `used=true` → 触发 `Cost` 时机 | ✅ |
| 14 | 执行 `effect` 回调 → 触发 `Effect` 时机 | ✅ |
| finalize | `_currentEffect` 栈 pop + processCompleted | ✅ |

### 与旧项目的差异

| 点 | 旧项目（event.skill.ts） | 新项目 |
|---|---|---|
| 选择结果注入 | init 中解析 `req.result`（cards/targets 从询问结果提取） | choose 回调返回值 + ChooseManager ID 还原 |
| **明置武将牌** | 走 `room.open()` **明置事件**（reason='useskill'，进入 Open 时机链/延迟明置队列） | 直接 `turnTo(true)`，**不触发明置事件** ⚠️ |
| 动画/配音 | priorityType < 3 时内联广播 | TODO 通讯模块 |

> ⚠️ 明置差异（裁定 R2，2026-07-18）：**新项目现实现不对**。应参照旧项目：用 open 方法调用 **ChangeStateEvent（明置事件）**——事件内部完成属性修改（翻转）、规则技能提供的势力确定、注册到 `deferredOpens`；处理 deferredOpens 处遍历并**直接触发"明置后"时机**。步骤 3 的直接 `turnTo(true)` 待改（暂不改代码，见 pending-impl 裁定落实待办）。

### 时机对应

- `Cost`（'cost'，执行消耗后）——消耗完毕、`used=true` 后触发
- `Effect`（'effect'，发动技能后）——效果执行后触发
