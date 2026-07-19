# 旧项目技能参考

> 旧项目 `old/resgsv1/`（git HEAD）包含 27 武将 + 40 卡牌的完整实现。以下为移植时最有价值的参考文件。

## 查看旧代码的命令

```bash
# 查看具体技能实现
git -C old/resgsv1 show HEAD:server/src/extensions/standard/skills/wei/xuchu.ts

# 查看旧框架类型定义
git -C old/resgsv1 show HEAD:server/src/core/skill/skill.types.ts

# 查看旧 trigger 主循环（838-1140 行）
git -C old/resgsv1 show HEAD:server/src/core/room/room.ts

# 查看旧 UseSkillEvent
git -C old/resgsv1 show HEAD:server/src/core/event/types/event.skill.ts

# 列出旧 standard 扩展全部文件
git -C old/resgsv1 ls-tree -r HEAD --name-only server/src/extensions/standard/
```

## 关键参考文件

### 技能框架

| 文件 | 内容 |
|---|---|
| `server/src/core/skill/skill.types.ts` | 旧 TriggerEffectData / StateEffectData 接口 |
| `server/src/core/skill/skill.ts` | 旧 Skill / Effect / TriggerEffect 类 |
| `server/src/core/skill/effect.ts` | 旧 Effect 基类 |
| `server/src/core/room/room.ts` (L838-1140) | 旧 trigger 主循环 + askForSkillInvoke + needUseCard |

### 标准包技能实例

| 武将 | 文件 | 学习要点 |
|---|---|---|
| 许褚-裸衣 | `standard/skills/wei/xuchu.ts` | 延时类效果：发动时注册子 Effect、cost 改 ratedDrawnum |
| 关羽-武圣 | `standard/skills/shu/guanyu.ts` | 转化技：将牌当杀使用/打出 |
| 孙权-制衡 | `standard/skills/wu/sunquan.ts` | 出牌阶段限一次 + 弃牌摸牌 |
| 华佗-急救 | `standard/skills/qun/huatuo.ts` | 回合外转化技 + 回血 |
| 司马懿-反馈/鬼才 | `standard/skills/wei/simayi.ts` | 受到伤害后反馈 + 改判 |
| 郭嘉-天妒/遗计 | `standard/skills/wei/guojia.ts` | 判定后获得牌 + 受到伤害后分牌 |
| 张辽-突袭 | `standard/skills/wei/zhangliao.ts` | 摸牌阶段替代效果 |
| 马超-马术/铁骑 | `standard/skills/shu/machao.ts` | 状态类（距离修正）+ 触发类（判定） |

### 卡牌实现参考

| 文件 | 学习要点 |
|---|---|
| `standard/cards/basic/sha.ts` | 杀的使用定义 |
| `standard/cards/basic/shan.ts` | 闪的打出定义 |
| `standard/cards/basic/tao.ts` | 桃的使用定义 |
| `standard/cards/equip/qinggangjian.ts` | 青釭剑：无视防具 |
| `standard/cards/equip/tengjia.ts` | 藤甲：防具技能 |
| `standard/cards/scroll/guohechaiqiao.ts` | 过河拆桥：锦囊使用 |
| `standard/cards/scroll/shandian.ts` | 闪电：延时锦囊 |

## 新旧关键差异

移植时注意这些核心变化：

| 概念 | 旧项目 | 新项目 |
|---|---|---|
| Effect 类 | TriggerEffect / StateEffect 独立子类 | 统一 Effect，has_trigger + has_state 双标志 |
| Skill 定义 | `sgs.define({...})` 全局注册 | `new SkillBuilder('name')` + `.register()` |
| 触发时机 | `EventTriggers.DamageInflictAfter` 字符串 | `TimingName.DamageInflictAfter` const enum |
| 上下文类型 | `TriggerEffectContext` 弱类型 `[key:string]:any` | `EffectContext` 接口（仍有 index sig 但有关键字段） |
| 选择器 | `getSelectors() → { skill_cost: { selectors, options } }` 双层嵌套 | `selectors: EffectSelectors` 扁平化（但尚未有消费方） |
| 明置武将 | `room.open()` 走 ChangeStateEvent | ⚠️ 当前直接 `turnTo(true)`（A2 待修复） |
| 优先级 | order 0-7 硬编码 switch | `PriorityType` 枚举 + `triggerEffects` Map 索引 |
