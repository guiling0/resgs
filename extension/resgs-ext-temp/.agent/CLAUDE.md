# 扩展编写指引

## 扩展隔离

扩展**不能** `import` 核心模块。所有类型和 API 通过 `sgs` 全局对象访问：

```ts
// ✅ 正确——通过 sgs 全局对象
const builder = new sgs.SkillBuilder('jianxiong');
builder.addEffect('trigger')
    .on(sgs.TimingName.DamageStart)
    .effect(async (room, player) => { ... });

// ❌ 错误——import 核心模块（扩展编译时不包含核心）
import { SkillBuilder } from '../shared/core/skill/builder/SkillBuilder';
```

## Builder API 参考

### SkillBuilder
```ts
new sgs.SkillBuilder(name: string)
    .addEffect('trigger' | EffectBuilder)  // 添加效果
    .condition(fn)   // 基础技能条件
    .visible(fn)     // 是否可见
    .global(fn)      // 全局显示
    .register()      // → SkillData（返回数据）
```

### EffectBuilder
```ts
builder.addEffect(name: string)
    .on(sgs.TimingName.xxx)   // 触发时机
    .condition(fn)            // 发动条件
    .cost(fn)                 // 消耗
    .effect(fn)               // 效果
    .times(n)                 // 限次
    .tag([sgs.SkillTag.Lock]) // 标签
    .state(type, fn)          // 状态效果
```

### GeneralBuilder
```ts
new sgs.GeneralBuilder(name: string)
    .kingdom('wei')          // 势力
    .hp(4)                   // 体力（支持 [初始,上限] 或 [初始,上限,护盾]）
    .gender(sgs.Gender.Male) // 性别
    .skills(['jianxiong'])   // 技能
    .lord(true)              // 是否主公
    .register()              // → sgs.generals
```

### CardBuilder
```ts
new sgs.CardBuilder(name: string)
    .type(sgs.CardType.Basic)        // 类别
    .subtype(sgs.CardSubType.Basic)  // 副类别
    .suit(sgs.CardSuit.Spade)        // 花色（可选）
    .number(sgs.CardNumber.A)        // 点数（可选）
    .damage(true)                    // 伤害牌
    .recover(false)                  // 回复牌
    .register()                      // → sgs.carddatas + sgs.cards
```

### ModeBuilder
```ts
new sgs.ModeBuilder(name: string)
    .maxPlayer(8)                              // 最大玩家数
    .isTeamMode(false)                         // 团队模式
    .settings({ enableLuckyCard: [] })         // UI 设置
    .rules('standard_rules')                   // 规则技能
    .beforeStart(async (room) => { ... })      // 开始前回调
    .mainProcess(async (room, turn, last) => { ... })  // 自定义流程
    .register()                                // → sgs.modes
```

## 注册约束

- `.register()` **幂等**——重复调用不重复注册，返回已有数据
- `.register()` **自动写入** `sgs.*` 注册表，无需手动 `sgs.xxx.set()`
- 导入即注册——扩展入口文件通过 side-effect import 触发全部注册

## 文件结构

```
extension/<name>/
  index.ts              ← JSDoc 元数据 + re-export 副作用
  generals/             ← 武将定义（GeneralBuilder）
    caocao.ts
  skills/               ← 技能定义（SkillBuilder + EffectBuilder）
    jianxiong.ts
  cards/                ← 卡牌定义（CardBuilder）
    sha.ts
  modes/                ← 模式定义（ModeBuilder）
    standard.ts
  assets/               ← 资源文件（图片、音频）
  .agent/               ← AI 编码指引
    CLAUDE.md
    skill.md
    knowledge/
    issues/
```

## 元数据规范

入口文件顶部 JSDoc + `export const meta`：

```ts
/**
 * @name standard
 * @description 身份局标准版扩展包
 * @author ddgl
 * @version 1.0.0
 */
export const meta = { name, description, author, version };
```

## 发布流程

```bash
npx tsx scripts/build-types.ts            # 生成 .d.ts
npx tsx scripts/build-registry.ts         # 扫描扩展 → registry.ts
npx tsx scripts/build-extension.ts <name> # 打包为 IIFE
npx tsx scripts/publish-extension.ts <name> # 上传 CDN
```
