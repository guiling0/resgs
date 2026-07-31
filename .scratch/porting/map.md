# 移植路线图

> 组织原则：**按玩家使用顺序**（加载→登录→大厅→房间→游戏→游戏内最小单元），每步服务端+客户端联动打通。
> shared/ 引擎按里程碑增量复原，不提前过度设计。

---

## 里程碑

| 里程 | shared/ 复原 | 服务端 | 客户端 | 验收 |
|---|---|---|---|---|
| ✅ **L0** 加载+登录 | — | 服务启动 + DB连接 + Auth路由 + JWT | 加载→登录界面（Vite+DOM） | ✅ 启动服务→客户端注册/登录 |
| ✅ **L1** 大厅+房间 | Room + RoomState + Player + 基础 Manager | LobbyRoom + GameRoom(创建/加入/准备/踢人) | 大厅(列表+筛选+聊天)→等待房间(座位+准备+聊天) | ✅ 建房→加房→准备→开始 |
| 🔴 **L2** 回合/阶段+牌移动+规则技能+询问 | Turn+Phase+MoveCard 事件 + ChooseManager + 规则技能 | startGame + Phase.Play 接入 ChooseManager | 回合显示+手牌渲染+牌移动动画+选择UI+技能按钮 | 六阶段轮转+摸牌动画+出牌询问 |
| ⬜ **L3** 牌使用+出牌+响应 | CardUse + UseCardEvent + DropCardEvent | 使用牌流程 + 闪响应 | 出牌交互+目标选择+响应提示 | 出杀→选目标→闪→结算 |
| ⬜ **L4** 伤害/回复/濒死/死亡 | Damage+Hp+Dying+Death 事件 | 伤害链→濒死求桃→死亡离场 | 伤害动画+体力变化+死亡UI | 完整生命链闭环 |
| ⬜ **L5** AI+武将+锦囊/装备 | 27 武将 + 40 卡牌 + StateEffect | AI 决策 + 空位填 AI | 技能动画+标记+锦囊选择 | 单人完整对局 |
| ⬜ **L6** 联机+动画+录像 | 录像事件记录 + 快照 | 断线重连 + 观战 + 聊天 + 对局落库 | AniPlayer+音效+回放UI | 多客户端联机+回放 |

> **客户端技术栈**：Vite + TypeScript + 纯 DOM/CSS（Widget 建造器模式），设计分辨率 1920×1080 等比缩放。
> **下一步**：L2 前先做预制体 UI（卡牌、武将、局内玩家框、动画）。

## 游戏内最小单元顺序（L2-L4）

```
Turn/Phase → MoveCard 牌移动 → ChooseManager 询问
  → 规则技能 (摸牌/出牌/弃牌)
  → CardUse 数据注册 → room.useCard 使用牌
  → Damage/Recover → Dying/Death → 武将技能
```

## 当前状态

- **L0 加载+登录** ✅ 完成 — 服务启动/DB连接/JWT/客户端登录界面
- **L1 大厅+房间** ✅ 完成 — 房间列表+聊天+创建/加入/准备
- shared/ 引擎代码待复原（L2 起）
- 客户端技术栈已变更为 **Vite + TypeScript + 纯 DOM/CSS**（原 LayaAir 3.4 存档于 `old/client/`）
- **下一步**: 预制体 UI（卡牌、武将、局内玩家框、动画）

## 技术决策

1. 玩家使用顺序驱动里程碑，每步端到端可验证
2. shared 增量复原，按里程碑需要逐步加入
3. 客户端 Vite + TS + 纯 DOM/CSS（Widget 建造器 + 场景模板分离）
4. 数据库 MongoDB 共置，L6 多进程上线
5. Token: Access 15min(内存) + Refresh 7d(LocalStorage)
6. 武将按扩展包→势力移植
