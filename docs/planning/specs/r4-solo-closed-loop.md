# R4 单机闭环（Solo Closed Loop）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r4.md](../issues/r4.md)

## 需求

让**人类玩家**可玩完整一局：内置身份模式、人类输入接管、选择 UI、GameView 完备，并完成同步完备性验证与编译引用修复。

1. **内置身份模式**：按 [standard-mode-setup.md](../../domain/events/standard-mode-setup.md) 实现——游戏目标/身份座次/选将/体力牌/起始手牌 4 张/牌堆 108 张
2. **SoloInputHub + AutoInput 完善**：人类输入接入（点击手牌/按钮）；AI 按行为规格推进（见 plans 的 AI 行为规格表）
3. **选择 UI**：选将弹窗、目标选择、弃牌选择、技能发动选择（复用 ChooseManager 的 SelectSession wire 层）
4. **GameView 完备**：手牌区可点、装备区/判定区显示、按钮（出牌/技能/结束）、座位交互（观察台 v2 完整化）
5. **同步完备性验证**：LocalTransport snapshot/patches 回放一致 + 事件消息顺序（状态先于业务消息）
6. **编译引用修复**：client/ 与 server/ 对 shared 的引用恢复（R0-R3 期间 import 断裂的收尾）

## 目标

- 人类 vs AI 完整一局：选将→出牌→伤害→濒死→死亡→胜负
- 「询问前状态先行」「扣血+动画同批次原子」在观察台可验证

## 前置依赖

- R3（技能框架）

## 验收标准

1. 人类 vs AI 完整一局可玩（8 人身份局：选将→起始手牌→回合操作→战斗→死亡→胜负），无挂死
2. 选择 UI 全部可用：选将/目标/弃牌/技能发动
3. 同步完备性：任意操作序列下，host 快照与 client 镜像回放一致；询问前状态先行
4. 编译修复：`tsc` 对 shared/client/server 均通过（server 部分可暂以 stub 编译）
5. plans 验收清单「单机核心」1-8 项全量勾选（开局/回合流转/出牌/规则事件/同步观察/技能/标记/AI 推进）

## 产出物

- `shared/core/mode/standard.ts`（身份模式）
- `client/`（GameView 完备：SoloInputHub/选择 UI/单机入口）
- 观察台 v2（完整 GameView）
- shared/client/server 三端编译恢复
