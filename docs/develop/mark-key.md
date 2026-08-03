# 标记键（Mark Key）命名约束

> 开发者参考：编写标记（Mark）相关代码时，遵循本文的 key 编写约束。
> 实现：[Mark.ts](../../../shared/core/entity/Mark.ts) · 设计背景：[mark-system-design.md](../planning/specs/mark-system-design.md)

## 一、格式文法

```
rawKey := 原始键 ('@' 标签)* ('-' 生命周期 | '--' 生命周期)?
标签 := 名称 | 名称 ':' 数据
生命周期 := 时机枚举字符串
```

- `@` 分隔标签段；标签可选 `:数据` 携带值
- `-when`：在时机 `when` **结束后**清理
- `--when`：在时机 `when` **开始前**清理
- 使用生命周期时必须带 `[]`（空标签段也要有 `@`，如 `key@-turn`）
- 原始键建议只用字母/数字/下划线，避免与生命周期后缀歧义

## 二、标签表

### 通用标签

| 标签 | 语义 |
|---|---|
| `@src:xx` | 来源（技能/效果名） |
| `@show` | 提供即显示；**默认不显示** |
| `@never` | 不受默认清理流程管理（`clearMark()` 不清理；生命周期清理优先于它） |
| `@img:xx` | 标记图片资源文件名。UI 解析规则：当前使用武将的资源根目录 > 通用目录 |
| `@key` | UI 显示标记时仅显示标记名，不对值做处理 |
| `@prompt` | UI 特殊处理（记录即可，不按常规显示）；隐含 `@show` |

### 值解析标签（以下均作用于 UI 显示）

| 标签 | 值解析规则 |
|---|---|
| `@card` | 值解析为卡牌 id 列表。可传 GameCard（或数组），标记值存 id（或数组），`data` 备份原对象 |
| `@general` | 值解析为武将 id 列表，其余同 `@card` |
| `@command` | 值解析为军令 id（无对象，本身为 number） |
| `@suit` | 值解析为花色（枚举对象，值本身为 number） |
| `@color` | 值解析为颜色（枚举对象，值本身为 number） |
| `@num` | 值解析为点数（UI 显示对 1/11/12/13 转义为 A/J/Q/K，实际值仍为 number） |
| `@ref:{areaid}&{mark}` | 设置时无需提供值（用 `true` 保证 key 存在）；获取时返回指定区域下带该 mark 的卡牌；`{areaid}-g` 变体返回带 mark 的武将牌（依赖区域/卡牌实体，待实现） |

### 增强文本

标记值可直接传增强文本对象：`{ text: 'xxx', args: { ... } }`，存储与序列化无需特殊处理（UI 按类型渲染）。

## 三、示例

```ts
// 基础计数标记（默认不显示）
player.setMark('sha_times', 3);

// 全员显示 + 来源
player.setMark('sha_times@show@src:caocao', 3);

// 卡牌 id 列表（传对象自动转 id）
player.setMark('viewed@card@show', [cardA, cardB]);

// 图片标记
player.setMark('tie@img:tie_red', true);

// 生命周期：回合结束清理 / 阶段开始前清理
player.setMark('add_max_cards@-turn', 1);
player.setMark('temp@--phase', 1);

// 豁免默认清理
player.setMark('keep@never', 1);

// 部分可见（仅指定玩家 UI 可见，权威端记录）
player.setMark('hand_count', 5, ['p1', 'p2']);
```

## 四、生命周期清理调用

事件系统在对应时机触发时调用（由 Room 层接入）：

```ts
// 时机结束后清理（匹配 key 中 -when）
entity.clearMarkByLife(when, false);
// 时机开始前清理（匹配 key 中 --when）
entity.clearMarkByLife(when, true);
```

生命周期清理**优先于** `@never`（带生命周期的标记按时机清理）。
