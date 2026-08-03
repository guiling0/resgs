# R5 标准内容追齐（Standard Content）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r5.md](../issues/r5.md)

## 需求

让 **standard + ex.standard（军争）** 的牌与武将技能全部生效，docs/domain/events 14 档事件全量落地，复杂机制启用。

1. **牌全量**：标准 108 张（基本/锦囊/装备）+ 军争牌（酒/火杀/雷杀/火攻/铁索连环/古锭刀等），实体牌按旧项目 cards 数据逐张核对（花色/点数/种类）
2. **标准武将全量**：standard 包全部武将技能实现（参考旧 `old/resgsv1/server/src/extensions/datas/` 与 `.tmp/shared-backup/datas/`），技能行为由 sgs-extension 技能学习旧实现后补全
3. **复杂机制全档启用**：
   - 拼点（[pindian.md](../../domain/events/pindian.md)）
   - 明置/势力/珠联璧合/君主技（[change-state.md](../../domain/events/change-state.md)）
   - 连环状态与传导（[damage.md](../../domain/events/damage.md)）
   - 翻面/叠置（[general-operations.md](../../domain/terms/general-operations.md)）
   - 转化技/视为（[card-operations.md](../../domain/terms/card-operations.md)）
   - 延时锦囊判定（[phase.md](../../domain/events/phase.md)）
4. **客户端监听配套**：拼点结果、明置动画、连环标记、翻面显示等消息与 UI

## 目标

- 标准内容可完整对局：所有标准牌可用、所有标准武将技能可发动
- 14 档领域事件文档全部有对应实现

## 前置依赖

- R4（单机闭环）；部分复杂机制（拼点/明置）可拆为独立子增量在 R5 内串行

## 验收标准

1. standard + 军争全部实体牌存在且数据正确（与旧项目 cards 对照）
2. 全部标准武将技能在人类 vs AI 对局可复现，行为与旧项目对齐（日志证据）
3. 拼点/明置/连环/翻面/转化等机制各有一局以上可复现验证
4. docs/domain/events 14 档事件在代码中可检索到对应实现，语义一致
5. 无挂死；AI 在引入复杂机制后仍可推进对局

## 产出物

- 标准牌全量（resgs-ext-temp/pkg/cards/）
- 标准武将全量技能（resgs-ext-temp/pkg/generals/standard/，按势力分目录）
- `shared/core/event/` 复杂机制事件补齐（PindianEvent/ChangeStateEvent 等）
- 客户端监听与消息扩展

## 备注

- 本增量工作量较大，按「技能学习义务」分批推进：先 standard 基本技能，后军争与复杂机制；每批完成即对局验证（用户仅主导少量关键技能示范）
