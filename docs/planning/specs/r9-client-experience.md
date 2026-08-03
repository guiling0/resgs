# R9 客户端体验追齐（Client Experience）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r9.md](../issues/r9.md)

## 需求

将 old/resgsv1 **clientv0** 的完整客户端功能逐项迁移到新 LayaAir 客户端（复用 R0-R4 建立的传输层与 GameView），对照旧 UI 清单逐项对齐。

1. **大厅**（旧 UILobby/UILobbyItem/LobbyComp）：房间列表、创建/加入房间、玩家信息
2. **房间**（旧 UIRoom/UISeat/UIItems）：座位、准备/开始、房主管理、聊天
3. **游戏桌完整化**（旧 UIGameRoom/UISelfSeat/UISeatGeneral/UISeat）：座位布局、手牌/装备/判定区、技能按钮（UISkillButton）、武将头像（UIGeneralAvatar/UIGeneralHp）、体力显示、标记显示（UITextMark/UIMark）、状态图标（翻面/连环/明置）
4. **选择与弹窗**（旧 UIChooseCards/UIItems/UIItemsRow/UIOptionButton/UIDialog/UIPaoPao/UIWindow）：目标选择、弃牌/给牌选择、技能发动、确认弹窗
5. **聊天**（旧 UIChat/UIIcon）：公屏/私聊/表情
6. **录像**（旧 Replay/UIVideo/UIVideoItem）：对局录像保存与回放
7. **音效**（旧 UISkillAudio/Resources/audio 资源）：技能语音/音效/背景音乐
8. **武将皮肤动画**（旧 UISkinAnimation/effects/ 7 个武将特效）
9. **设置/关于**（旧 UIAbout/UIAboutCard/UI3V3Confirm 等）

## 目标

- 新客户端功能与 clientv0 对齐清单逐项勾选；人类 vs AI 对局中全部 UI 功能可用
- 资产迁移（bin/assets 资源）按功能模块渐进，避免一次性大搬迁

## 前置依赖

- R4（GameView 与传输层）；可与 R5-R8 渐进并行

## 验收标准

1. 对照 clientv0 功能清单逐项勾选（大厅/房间/游戏桌/选择/聊天/录像/音效/动画/设置），无缺失项
2. 人类 vs AI 对局中全部 UI 功能可用且交互正确
3. 录像可保存并回放完整一局
4. 音效与皮肤动画在关键节点触发（出杀/受伤/发动技能/濒死）
5. 性能：8 人对局动画/消息流畅无卡顿

## 产出物

- `client/` 下各功能模块 UI（对照 clientv0/src/ui/ 逐项迁移）
- 资产迁移（bin/assets → client/assets）
- 录像存储客户端侧（回放数据经 LocalTransport/协议）

## 备注

- clientv0 为旧 LayaAir 项目（client.laya），新客户端同为 LayaAir 3.4，预制件/脚本可参考迁移；DOM 试作（client-dom，已 gitignore）仅作布局参考不复用
