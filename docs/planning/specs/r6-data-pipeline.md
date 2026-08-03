# R6 数据管线（Data Pipeline）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r6.md](../issues/r6.md)

## 需求

将 old/resgsv1 的 **datas JSON（20+ 武将包）** 通过生成器批量转为「武将壳子」TS 代码，接入新引擎装载机制，保证全量数据可装载、可扩展。

1. **生成器**（`scripts/gen-generals.ts`）：读取 `old/resgsv1/server/src/extensions/datas/`（或 `.tmp/shared-backup/datas/`）JSON → 产出「武将壳子」TS 代码：
   - 武将：name/kingdom/hp/gender/skills 列表/lord/enable/hidden/素材路径
   - 翻译表：武将名/技能名/描述（translations）
   - 技能壳：SkillBuilder + 空回调（待行为实现）
2. **包组织**：按数据包（standard/ex.standard/shenhua/mobile/ol/ten/wars 系列/1v1/3v3 等）生成对应扩展包目录与注册文件，纳入 `extension/` 体系
3. **装载验证**：sgs.generals/sgs.modes/sgs.cards 全量装载无冲突、无崩溃
4. **概念表/翻译表迁移**：`datas/lang/` 的翻译/概念数据迁入 sgs.translations/concept

## 目标

- 20+ 包全部武将可装载进引擎（壳子形态），行为由后续增量（R7/R8 及内容推进）逐包填充
- 生成器可复现（数据源变更 → 重新生成），不手工维护壳子

## 前置依赖

- R0（sgs 注册/装载机制）；可与 R5 并行

## 验收标准

1. 生成器可复现执行；产出代码 `tsc` 通过
2. 全量装载：sgs.generals 中武将数量与 datas JSON 一致（抽样核对 ≥3 包）；无 id 冲突告警
3. 翻译/概念表装载后可 `sgs.getTranslation/getConcept` 正确查询
4. 装载后单机开局不崩（与 R5 内容结合验证）

## 产出物

- `scripts/gen-generals.ts`（生成器）
- `extension/` 下按包组织的武将壳子代码
- 翻译/概念数据接入

## 备注

- 生成器是**迁移工具**非运行时依赖：运行时唯一数据源仍是代码（见 plans「数据策略」）
- 壳子技能的「行为」遵循技能学习义务：学习旧 `extensions/` 与 `datas/` 实现后填充，随各包进入验证流程
