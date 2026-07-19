# EffectBuilder / SkillBuilder 完整 API

> 来源：[EffectBuilder.ts](../../shared/core/skill/builder/EffectBuilder.ts)、[SkillBuilder.ts](../../shared/core/skill/builder/SkillBuilder.ts)。

## SkillBuilder

### 属性

| 属性 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `name` | `string` | — | 技能名称，如 `'xuchu.luoyi'` |
| `data` | `Record<string, any>` | `{}` | 自定义数据 |
| `is_rule` | `boolean` | `false` | 是否为规则技能 |
| `is_lord` | `boolean` | `false` | 是否为主公技能 |
| `attached_equip` | `string` | — | 哪个装备的技能 |
| `attached_kingdom` | `string` | — | 势力限制（仅用于势力技） |

### 方法

| 方法 | 返回值 | 说明 |
|---|---|---|
| `addEffect(name \| EffectBuilder)` | `EffectBuilder` | 添加效果；传字符串创建新 EffectBuilder，传已有 builder 直接复用 |
| `condition(fn)` | `this` | 技能基础条件：`(this: Skill, room: Room) => boolean` |
| `visible(fn)` | `this` | 是否可见：`(this: Skill, room: Room) => boolean` |
| `global(fn)` | `this` | 全局按钮显示：`(this: Skill, room: Room, player: Player) => boolean` |
| `refresh(data)` | `this` | 注册刷新回调（时机 before/after） |
| `ai(config)` | `this` | AI 配置 |
| `register()` | `SkillData` | 构建并返回 SkillData 对象 |

## EffectBuilder

### 基本配置方法

| 方法 | 参数 | 说明 |
|---|---|---|
| `tag(tags)` | `SkillTag[]` | 技能标签数组 |
| `settings(config)` | `Partial<EffectSettings>` | 合并效果设置 |
| `priority(p)` | `PriorityType` | 优先级：General(1) > Equip(2) > Card(3) > Rule(4) |
| `condition(fn)` | `(this, room, ctx?) => any` | 非时机条件（独立于 can_trigger） |
| `mark(name)` | `string \| string[]` | 拥有效果时显示的标记 |
| `data(obj)` | `Record<string, any>` | 自定义数据 |
| `select(name, ...configs)` | `SelectorConfig[]` | 添加选择器配置 |

### 触发类方法（按发动流程排列）

| 方法 | 签名 | 说明 |
|---|---|---|
| `on(trigger)` | `(trigger: TimingName)` | 绑定发动时机 |
| `can_trigger(fn)` | `(this, room, player, data) => any` | 时机条件，返回真值 = 可发动 |
| `context(fn)` | `(this, room, player, data) => EffectContext` | 构建上下文（from/targets 等） |
| `choose(fn)` | `(this, room, player, data, ctx) => any` | 发动前选择，返回 falsy = 不发动 |
| `cost(fn)` | `(this, room, player, data, ctx) => any` | 消耗，返回 falsy = 不发动 |
| `effect(fn)` | `(this, room, player, data, ctx) => any` | 效果执行 |

### EffectContext

```typescript
interface EffectContext {
    from: Player;                              // 发动者
    event?: EventProcess;                      // 触发源事件
    cost?: Record<string, any[]>;              // cost 返回值
    selections?: Record<string, Record<string, any[]>>;
    [key: string]: any;                        // 扩展字段
}
```

### EffectSettings 完整字段

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `forced` | `'mute' \| 'cost'` | `'mute'` | mute=自动发动；cost=套询问 |
| `audios` | `string[] \| 'extends'` | `'extends'` | 配音文件路径；extends=继承技能配音 |
| `temp` | `boolean` | `false` | 临时效果：获得技能时不自动获得此 Effect |
| `ani` | `string` | `'text'` | 发动动画类型 |
| `log` | `boolean` | `true` | 是否自动输出战报 |
| `toast` | `boolean` | `true` | 是否弹出提示 |
| `sort` | `boolean` | `true` | 是否对技能目标排序 |
| `directline` | `number` | `1` | 指向线类型（0=无） |
| `limitAni` | `boolean` | `true` | 限定技特效 |
| `awakeAni` | `boolean` | `true` | 觉醒技特效 |
| `viewas` | `boolean` | `true` | 转化牌标记（需要使用/打出时有效） |
| `global` | `boolean` | `false` | 检测所有人而不仅是拥有者 |
| `arraytype` | `'quene' \| 'single'` | — | 阵法技类型 |

### SkillBuilder.refresh() 与 EffectBuilder.refresh()

```typescript
// 注册时机回调（在触发扫描前后执行）
skill.refresh({
    trigger: TimingName.TurnStart,
    position: 'before',  // 或 'after'
    fn: function(room, data) { /* ... */ }
});
```

**refresh 与 can_trigger 的区别**：refresh 回调**无条件**在时机前后执行，用于更新效果内部状态；can_trigger 是**条件性**的，仅在满足条件时才进入询问/发动流程。

### EffectBuilder.build(skillName)

将 EffectBuilder 转换为 EffectData 对象。通常不需要手动调用——`SkillBuilder.register()` 内部会对每个 effect 调用 `.build(skillName)`。

完整效果名格式：`'{skillName}.{effectName}'`，如 `'xuchu.luoyi.delay'`。
