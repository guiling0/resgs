# R8 高级扩展（exyj / oxsp / wars + 国战）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r8.md](../issues/r8.md)

## 需求

重写剩余三个扩展（exyj、oxsp、wars）并落地**国战机制**（明置/势力/珠联璧合）。

1. **exyj（一将成名）**：扩展武将包 + 技能实现（学习旧 `extensions/exyj/`）
2. **oxsp**：扩展武将包 + 技能实现（学习旧 `extensions/oxsp/`）
3. **wars**：含 mode + rule（学习旧 `extensions/wars/`，注意其 rule.ts 定义的独有规则）
4. **国战机制**（若 wars/国战包涉及）：明置武将/势力归属/珠联璧合/君主技——[change-state.md](../../domain/events/change-state.md) 全档落地；武将牌堆/叠置
5. **协议与客户端**：明置动画、势力显示、珠联璧合提示等消息与监听

## 目标

- 三个扩展可加载可玩，特殊机制正确；国战玩法可复现

## 前置依赖

- R7（模式扩展：复用模式/武将装载链路）

## 验收标准

1. exyj/oxsp 扩展可加载，其武将技能在对局中可发动（抽样验证）
2. wars 模式一局可玩，rule 规则（如胜负/限时/独有机制）正确
3. 国战（如实施）：明置武将后势力确定、同势力队友显示、珠联璧合触发；君主技生效
4. 每个扩展有 1 局以上人类 vs AI 对局日志证据

## 产出物

- `extension/` 下 exyj、oxsp、wars 扩展包
- 国战机制（change-state 全档）在 shared/core 与客户端 UI 落地

## 备注

- 本增量以 sgs-extension 技能自主学习为主；若 wars/国战与旧项目差异大（规则冲突），停下来与用户对齐后再实施（改动确认制）
