# M3 响应闭环 Spec

> 状态: `ready-for-agent`
> 里程碑: M3 响应闭环
> 父文档: [map.md](map.md)

---

## Problem Statement

M2 打通了**无响应路径**（出杀→掉血、出桃→回血），但实际游戏中对手会响应——出杀时目标可以出闪抵消，濒死时全场可以出桃救援。当前 UseCardEvent 的"目标是牌"分支未实现、trigger 中没有 needUseCard 逻辑，导致响应链路完全断开。

---

## Solution

在 `EventManager.trigger()` 中接入 needUseCard 逻辑——当 trigger 在特定时机（EffectBefore、Dying 等）触发时，自动检测可用的默认卡牌并询问玩家是否需要使用。

```
trigger(EffectBefore)
  → needUseCard 检测：默认时机=EffectBefore 的卡牌（闪）可用
  → trigger(Need1) → 响应技询问（护驾/激将）
  → need2 技能检测 → 与使用牌询问一同发送客户端
  → 目标选择使用闪 → UseCardEvent(目标是牌) → offset 杀

trigger(Dying)
  → needUseCard 检测：默认时机=Dying 的卡牌（桃）可用
  → 轮询全场 → 有人出桃 → 回复体力 → 脱离濒死
```

**关键洞察**：EffectBefore 和 Dying 是已有的时机——它们会自然触发 `EventManager.trigger()`。只需在 trigger 核心逻辑中增加 needUseCard 步骤，无需在 UseCardEvent 或 DyingEvent 中显式处理。

验收：出杀→EffectBefore 的 trigger 自动询问闪→目标出闪→杀被 offset→无伤害；致命伤害→Dying 的 trigger 自动轮询桃→出桃救回。

---

## User Stories

1. As a 玩家, I want 被杀指定为目标时可以使用闪来抵消, so that 我能避免受到伤害
2. As a 玩家, I want 使用闪抵消杀后杀的效果不执行, so that 我不会掉血
3. As a 玩家, I want 濒死时全场可以出桃救我, so that 我能存活
4. As a 玩家, I want 有人出桃后我回复体力并脱离濒死, so that 游戏继续
5. As a 玩家, I want 濒死无人救时死亡, so that 游戏正确处理死亡流程
6. As a 玩家, I want 闪和桃作为响应使用时目标由服务端决定, so that 客户端无需选择目标
7. As a 游戏开发者, I want DropCardEvent 类支持打出牌操作, so that M4 需要打出牌的场景有事件基础设施
8. As a 游戏开发者, I want trigger 自动检测当前时机可用的卡牌并询问, so that 响应路径无需在各事件中单独接线
9. As a 游戏开发者, I want canUseCard 接受 VirtualCardData, so that 客户端和技能检测无需持有 VirtualCard 实例
10. As a 游戏开发者, I want headless 测试可以 mock 玩家选择, so that 响应路径可以在无客户端下验证

---

## Implementation Decisions

### D1: 新增/修改文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `shared/core/room/manager/EventManager.ts` | **修改** | trigger 中接入 needUseCard 逻辑 |
| `shared/core/event/UseCardEvent.ts` | **修改** | "目标是牌"分支（responseTo 路由） |
| `shared/core/event/DropCardEvent.ts` | **新增** | 打出牌事件类 |
| `shared/core/room/Room.ts` | **修改** | canUseCard 参数改为 VirtualCardData |
| `shared/core/room/manager/VirtualCardManager.ts` | **修改** | `createData()` 工具方法 |
| `shared/core/room/manager/CardManager.ts` | **修改** | 注册闪/桃 CardUse |
| `shared/test/m3-response.test.ts` | **新增** | M3 验收测试 |

### D2: trigger 中的 needUseCard 流程

在 `EventManager.trigger(timing)` 的核心循环中增加 needUseCard 步骤：

```
trigger(timing):
  1. [现有] 扫描该时机的触发技 → askForSkillInvoke 循环
  2. [新增] 检测默认时机为当前 timing 的卡牌：
     a. 遍历 sgs.carduses 中 timing 匹配的卡牌
     b. 对每个可用的卡牌名，检测玩家合法性
     c. 对每个合法玩家：
        - 调用 trigger(need1) → 标准触发技询问
        - 若已有玩家使用 → 结束
        - 发送"使用牌询问"（ChooseManager session）
        - 玩家选择 → 验证合法性 → 创建 UseCardEvent
        - 若玩家取消 → 继续下一个
     注：need2 按钮式技能（武圣/丈八）为 M4 范围
  3. [现有] refreshs-after
```

**EffectBefore 时机天然为此**——当 UseCardEvent 执行到 EffectBefore 时，trigger(EffectBefore) 自动通过步骤 2 发现闪并询问目标。

**Dying 时机天然为此**——当 DyingEvent 执行到 Dying 时，trigger(Dying) 自动通过步骤 2 发现桃并轮询全场。

### D3: "目标是牌"的 UseCardEvent 分支

M2 仅实现了"目标是角色"的基本牌分支。M3 需实现"目标是牌"分支（闪响应杀）：

UseCardEvent 新增 `responseTo?: VirtualCard` 字段。非空时：
- `_buildTriggers` 剔除 DeclareAfter~BecomeTargetAfter 段（无 assign/become 序列）
- 目标列表为空——targetList 中有 `responseTo` 而非玩家
- 客户端需要知道被响应的牌是哪个（服务端携带 responseTo 信息）
- 闪的效果 = offset 被响应的杀牌

### D4: canUseCard 参数改为 VirtualCardData ⚠️ 修订

**原 M2 实现中 `canUseCard` 接受 `string | VirtualCard`。修订为 `string | VirtualCardData`。**

原因：
1. 客户端不维护 VirtualCard 实例——只有 VirtualCardData
2. 检测时可能无实体 VirtualCard——技能检测需构造临时数据
3. 客户端确定按钮可用性——卡牌选完后可直接传 VirtualCardData 检测

```typescript
canUseCard(
    player: Player,
    cardNameOrVCData: string | VirtualCardData,
    target?: Player,
    opts?: { useModifiers?: UseModifiers }
): boolean
```

新增工具方法：
```typescript
vcard.createData(name: string, cards: GameCard[]): VirtualCardData
```

### D5: DropCardEvent 类

无目标、无动态时机的简化事件：

```
DropCardEvent extends EventProcess<EventType.DropCard>
  eventTriggers: [DropCardDeclare, DropCardDroped]
  endTriggers: [DropCardEnd]
  固定操作:
    Declare before: 实体牌移入处理区
    End after: 虚拟牌消失
```

打出牌的 need/pre 链路在 M4 锦囊牌场景中激活。

### D6: 闪 CardUse 注册

```typescript
{
    name: 'shan',
    timing: TimingName.UseCardEffectBefore,
    target: (room, player, card) => [],  // 目标是牌，不由玩家选择
    effect: (room, target, event) => {},  // 闪无独立效果——效果是 offset 杀
}
```

### D6b: 桃 CardUse 注册（Dying 时）

桃在 Dying 时作为使用牌的注册——与出牌阶段主动吃桃是独立的 CardUse 条目。

```typescript
{
    name: 'tao',
    timing: TimingName.Dying,
    target: (room, player, card) => [dyingPlayer],  // 目标是濒死角色
    effect: (room, target, event) => {},             // 桃虽有效果，但脱离濒死由 DyingEvent 响应侧处理
    canUse: (room, player, card) => room.eventStack.some(e => e.type === EventType.Dying),
}
```

### D7: M3 不修改 M2 已验证路径

- 出杀→掉血的无响应路径不变
- "目标是牌"分支仅在 `responseTo` 非空时激活
- M2 验收测试继续通过

---

## Testing Decisions

### 测试缝合点

1. **`room.useCard()` → EffectBefore trigger 自动询问闪**：出杀 → mock 目标选闪 → 杀被 offset → 无伤害
2. **`room.damage()` → Dying trigger 自动轮询桃**：致命伤害 → mock 桃 → 回复 → 脱离濒死
3. **`canUseCard(VirtualCardData)` 新签名**：用 `vcard.createData('sha', [card])` 构造数据检测

### 测试用例

1. **出杀→目标出闪→杀被抵消**：mock 目标选闪 → hp 不变
2. **出杀→目标不出闪→掉血**：mock 取消 → hp-1
3. **出杀→伤害→濒死→出桃救回**：mock 桃 → hp=1
4. **出杀→伤害→濒死→无人救→死亡**：mock 全取消 → 死亡
5. **闪抵消杀后 UseCardOffset 时机生成**：验证 offset 时机
6. **闪作为使用（目标是牌）不经过 AssignTarget 段**：验证 targetList 无玩家
7. **canUseCard 接受 VirtualCardData**：构造数据 → 正确返回布尔
8. **DropCardEvent 打出杀**（M4 南蛮/决斗场景）：实体牌入处理区 → 虚拟牌消失

### 参考现有测试

- [shared/test/m2-usecard.test.ts](shared/test/m2-usecard.test.ts)
- [shared/test/dying-death.test.ts](shared/test/dying-death.test.ts)

---

## Out of Scope

- **南蛮入侵/万箭齐发**（M4）
- **无懈可击**（M4）
- **need2 按钮式技能**：武圣/丈八等（M4）
- **濒死技**（M4）
- **酒**（M4）
- **无双类二段闪**（M4）
- **打出牌 need1 响应**（M4）

---

## Further Notes

- 旧项目参考：`old/resgsv1/server/src/core/event/event.play.ts`、`old/resgsv1/server/src/core/room/room.choose.ts`
- 设计决策权威来源：`docs/events/drop-card.md`、`docs/events/use-card.md`、`docs/events/dying-death.md`
- **闪、桃、无懈都是使用（UseCardEvent），不是打出（DropCardEvent）。打出是南蛮/决斗等强制响应场景（M4）**
- **EffectBefore 和 Dying 不需要显式接线**——trigger 的核心循环自动处理
