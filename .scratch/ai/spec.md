# AI 系统设计方案

> 目标：陪玩填座为主，架构为学习/模拟型演进留门。

---

## 一、方案选择

### 旧 CBR 方案为什么不合适

旧 `discuss/ai-design.md` 提出的 CBR + 规则混合方案存在致命问题：

1. **数据饥饿**：CBR 需要数万局训练数据才能产出有意义的推荐。个人项目对局量撑不起案例库。
2. **延迟归因噪声大**：事后 outcomeScore 无法准确归因到单个决策——一场游戏的胜负是数十个决策的叠加效果。
3. **冷启动 = 整个 Phase 1 白做**：规则引擎必然先行兜底，CBR 的数据积累是"未来才兑现的支票"。
4. **MongoDB 耦合**：将 AI 核心逻辑绑定到持久化层，`shared/ai/` 的纯逻辑优势被抵消。

### 新方案：效用评分规则 AI

```
AIPlayerInput (server)         ← 实现 IPlayerInput 接口
    │
    ├── AIManager.decide(session)
    │     ├── 按 selector.name 分发 evaluator
    │     ├── evaluator(h, candidates, context) → scores[]
    │     └── 取最高分候选 + ε-greedy 探索
    │
    └── ChooseManager.respond(sessionId, result)
```

**核心原则**：
- AI = `IPlayerInput` 的一个实现。引擎零改动，对 Room 只看到一个"会思考的输入设备"。
- evaluator 放在 `shared/ai/`（纯 TS，不依赖网络/DB）——未来客户端单机模式直接复用。
- 决策 = **效用评分**：每个候选动作一个分数，选最高分。确定性、可测试、可解释。

---

## 二、效用评分引擎

### 2.1 决策类型与 evaluator 映射

| 选择类型 (selector.name) | 触发时机 | evaluator |
|---|---|---|
| `discard` | 弃牌阶段 | `CardValueEvaluator` + `SafetyHeuristic` |
| `play_card` | 出牌阶段 | `CardUseEvaluator` + `TargetEvaluator`（逐候选人评分） |
| `choose_target` | 使用牌/技能选目标 | `TargetEvaluator` |
| `response_dodge` | 需出闪 | `DefenseEvaluator` |
| `use_skill` | 技能时机触发 | `SkillTriggerEvaluator` |
| `choose_general` | 选将 | `GeneralValueEvaluator` |
| *default* | 通用 | `GreedyLegalEvaluator`（取最高价值合法选项） |

### 2.2 共享评分表 (`sgs.scoreTable`)

同时驱动 AI 决策和 MVP 战后评分（战报排名 + AI 调试标尺）。

```text
伤害 (DamageEvent):
  对敌 +40/点    对友 -60/点    受伤 -30/点    属性伤害 ×1.2

回复 (RecoverHpEvent):
  回复友方 +35/点    回复自身 +25/点    回复敌方 -40/点

卡牌操作 (MoveCardEvent):
  摸牌 +5    使友摸 +8    拆牌 +10    被弃 -8

击杀 (DeathEvent):
  杀敌 +200    误杀队友 -300    死亡 -150

终局:
  胜利 +500    失败 -200    反贼杀主 +300    忠臣护主 +200
```

### 2.3 卡牌价值表 (`sgs.cardScore`)

旧项目 `core/sgs.ts:171` 中有一张无引用的 `card_score` 表——这是游戏常识，不是创新。重新设计为按阶段/情境使用的动态评分：

```
基础值: 杀=30, 闪=25, 桃=80, 无懈=60, 顺手=50, 过河=45, 乐不思蜀=40, ...
情境修正:
  - 残血(HP≤1)：桃 +50, 闪 +30
  - 场上无懈可击可能已用完：锦囊 +20
  - 目标是残血敌人：杀 +40
  - 目标有明闪：杀 -20，顺手 +20
```

### 2.4 零配置技能感知（保留旧方案最佳设计）

不手动为技能写标签。利用 `room.triggerEffects` 索引（EventManager 已维护）自动检测：

```
extractSkillContext(room, selectorName):
    for timing in getRelatedTimings(selectorName):
        for [playerId, effects] in room.triggerEffects[timing]:
            count = effects.filter(e => e.check()).length
            tag = getRelation(self, playerId)  // ally | enemy | self
            context["active_{tag}_skills"] += count
    return context
```

**效果**：检测到 `active_enemy_skills.discard_end = 1` → 结合该技能元数据（如二张的效果名含"collect_equip"）→ AI 自动推断弃装备风险高 → 调整评分。

### 2.5 局势特征

从旧 `client-tech.md` 和旧 AI 方案中保留的特征概念（重新精简）：

```
自身: hp_ratio, hand_count, equip_count, is_chained, shield
手牌: basic_count, tool_count, has_peach, has_dodge
最近敌人: hp_ratio, distance, equip_count
全局: alive_allies, alive_enemies, turn_number, phase
```

---

## 三、架构设计

### 3.1 模块边界

```
shared/ai/
  ├── AITypes.ts          # AI 内部类型
  ├── IAIManager.ts       # AI 决策接口
  ├── ScoreTable.ts       # 评分表（sgs.scoreTable + sgs.cardScore）
  ├── evaluators/
  │   ├── CardValueEvaluator.ts
  │   ├── TargetEvaluator.ts
  │   ├── DefenseEvaluator.ts
  │   ├── SkillTriggerEvaluator.ts
  │   ├── GeneralValueEvaluator.ts
  │   └── GreedyLegalEvaluator.ts
  └── utils/
      ├── FeatureExtractor.ts    # 局势特征提取
      └── SkillContext.ts        # 技能感知

server/src/ai/
  └── AIPlayerInput.ts    # implements IPlayerInput，装配 AIManager
```

**关键**：`shared/ai/` 纯逻辑，无 DB/网络依赖。`server/src/ai/` 只做装配。客户端单机模式可直接用 `shared/ai/`。

### 3.2 与 ChooseManager 集成

```
ChooseManager.request(session)
    │
    ▼ (玩家是 AI/robot)
AIPlayerInput.requestChoice(playerId, session)
    │
    ├── AIManager.decide(session) → result
    ├── 记录决策日志 (Phase B 钩子)
    └── ChooseManager.respond(sessionId, result)
```

AI 是一个 IPlayerInput 实现，引擎不区分人类和 AI。

---

## 四、进化路径

### Phase B：学习型

**前置条件**：决策日志积累。利用 Phase A 中已埋的日志钩子。

**方向**：
- 离线权重调优：从日志中学习最优评分权重（贝叶斯优化 / 遗传算法调优 `sgs.scoreTable` 权重）
- CBR 轻量版：不存全量快照，只存特征向量 + 选择 + 结果评分

### Phase C：模拟/搜索型

**前置条件**：seeded RNG + headless 自动对战。

**方向**：
- 抽样确定化模拟：对候选动作各模拟 N 步（seed 固定），取模拟收益最高的动作
- MCTS（蒙特卡洛树搜索）：利用 seeded RNG 做确定化展开，成本低于模拟每步都执行事件链

---

## 五、实验支持：自动对战

Phase A 交付后，自动对战的附加价值：

```
N 个 AI 实例 + seeded RNG → headless Room → 快速对局
  ├── 批量测试技能逻辑（Phase 8 反哺）
  ├── 积累决策日志（Phase B 数据源）
  └── 验证 AI 强度（回归测试）
```

**接入时机**：身份局最小可玩（M4）后立即开始 Phase A（= M5），自动对战反哺技能调试。

---

## 六、实施路线图

对应 `.scratch/porting/map.md` 的里程碑 M5：

| 步骤 | 内容 | 依赖 |
|---|---|---|
| **Phase A**（= M5 本体） | AIPlayerInput + AIManager + ScoreTable + 5 个 evaluator + 决策日志钩子 + seeded RNG + headless 自动对战 | M4（身份局最小可玩） |
| **Phase B** | 离线权重调优 / CBR 轻量版 | Phase A 日志积累 |
| **Phase C** | seeded RNG 确定化模拟 / MCTS | Phase A 自动对战基础设施 + 引擎稳定 |
