---
name: layaAir
description: 使用 LayaAir 引擎进行游戏开发的完整工作流指南，涵盖 TypeScript 代码编写、场景/预制体/UI 搭建、资源管理和 IDE MCP 工具使用。当用户涉及 LayaAir 引擎开发、LayaAir 场景编辑、LayaAir UI 制作、LayaAir 预制体操作、LayaAir 物理引擎配置，或使用 .ls/.lh/.lmat 等 LayaAir 资源文件时，都应使用此 skill。即使用户没有明确提到"LayaAir"，只要涉及 Laya 相关的 API、组件、场景文件格式，也应触发此 skill。
---

# LayaAir 游戏开发工作流

## 核心原则

**场景/预制体优先，代码承载逻辑**：优先通过场景搭建与复用 Prefab 来实现 UI 和节点结构，脚本只负责功能逻辑与交互。实现前先检索现有场景节点与 Prefab 是否可复用，再考虑新建。

**所有 LayaAir 资源文件（`.ls`/`.lh`/`.lmat`）必须通过 IDE MCP 工具操作**，绝对禁止使用 `write`、`Edit` 等文件操作工具直接修改。原因是 IDE 维护着资源索引、引用关系和 UUID 管理，直接操作文件会导致索引不同步、数据校验失败和 IDE 无法热更新。

---

## 一、项目配置识别

开始工作前，先读取 `settings/PlayerSettings.json` 确认以下配置：

### UI 类型

| `addons["laya.ui"]` 值 | 类型    | 可用组件                            |
| ---------------------- | ------- | ----------------------------------- |
| 字段不存在             | classic | 仅经典 UI（Box/Button/Label 等）    |
| `"both"`               | both    | 两套均可，同模块保持一致            |
| `"ui2"`                | new     | 仅新版 UI（GBox/GButton/GLabel 等） |

当用户提出的 UI 类型与项目配置不符时，必须先提醒用户存在不一致，不要修改配置设置 UI 模式，应终止操作。

### 物理引擎

| `physics3dModule` | 引擎   |
| ----------------- | ------ |
| 字段存在          | PhysX  |
| 字段不存在        | Bullet |

查询物理 API 时按引擎类型过滤。

---

## 二、代码开发规范

### 命名空间

必须使用 `Laya.` 前缀访问所有引擎类和静态方法：

- `Laya.Sprite`、`Laya.Handler.create(...)` — 正确
- `Sprite`、`Handler` — 错误

### 入口规范（Entry.ts）

入口函数结构固定，禁止修改：

```typescript
export async function main() {
    /* 正式初始化逻辑 */
}
```

禁止提交测试代码到 `main` 函数。

### 资源路径

- 禁止在代码中使用 UUID 引用资源
- 资源放在 `assets/resources/` 下，路径格式：`resources/子目录/文件名.扩展名`
- 若需引用 `resources` 外的资源，需在 `settings/BuildSetting.json` 中配置 `alwaysIncluded`，例如用到了 `assets/ui` 里的资源：
    ```json
    { "alwaysIncluded": ["ui"] }
    ```

### 脚本与组件职责边界

在脚本文件中只编写功能逻辑，组件添加操作必须通过 IDE MCP 接口完成。

---

## 三、MCP API 查询策略

LayaAir API 相关问题通过 MCP 查询，需附带版本号、UI 类型、物理引擎类型。

### 查询方式选择

| 场景 | 工具 | 示例 |
| --- | --- | --- |
| 已知类名，查成员详情 | `get_api_detail` | `name="Vector3"` 或 `name="Vector3.scale"` |
| 已知类名.成员名 | `get_api_detail` | `name="Sprite.addChild"` |
| 不确定 API 名称，按功能搜索 | `query_api` | `query="实现拖拽功能"` |
| 探索性查询 | `query_api` | `query="动画相关的类"` |

### 查询格式

- 精确查询优先：已知 API 名称时直接用 `get_api_detail(name="类名.成员名")`
- 查类成员：用 `get_api_detail(name="类名")` 获取完整方法/属性列表
- 模糊搜索：仅在不确定 API 名称时使用 `query_api`
- 格式要求：`Vector3.scale`（类名.成员名） — 不要加 `Laya.` 前缀，也不要用自然语言描述已知 API

### 版本与迁移

- 查询 API 时附加 `<LAYA_VERSION>` 版本号
- 迁移时对比 `<LAYA_PRE_VERSION>` 与 `<LAYA_VERSION>` 的 API 差异
- 以 MCP 返回的精准文档为准，自我修正幻觉

---

## 四、场景 / 预制体 / 资源编辑

3D 模型资源（`.fbx`、`.gltf`、`.glb`）可以直接作为预制体使用，无需手动转换。

### 编辑工作流（必须严格按顺序执行）

> **步骤 1 和步骤 2 是前置必要步骤，跳过会导致组件类型混用或属性格式错误，造成场景数据损坏。**

1. **确定 UI 体系**：先根据 `settings/PlayerSettings.json` 中的 `addons["laya.ui"]` 配置，明确当前项目使用的是新版 UI（`GBox`/`GButton`/`GLabel`/`GImage` 等，规则与 FairyGUI 相似）还是经典 UI（`Box`/`Button`/`Label`/`Image` 等）。选定需要用到的具体组件类型后，再进入下一步。新版和经典 UI 绝对不可混用。
2. **查询组件 Schema**：使用选定的组件 type，通过 `get_schema_by_name` 查询该组件的属性 schema。后续编辑时必须严格遵守 schema 定义的字段名和类型约束（例如数值型不能传字符串、枚举值必须在范围内），否则会导致 IDE 解析失败。
3. **检索现有参考**：检索当前场景文件中是否已有相似组件可以参考其结构和属性配置。
4. **执行编辑**：使用 `Laya_EditAsset` 对场景/预制体数据进行修改。

### IDE MCP 工具对照

| 操作类型 | 正确工具 | 禁止做法 |
| --- | --- | --- |
| 读取场景/预制体结构 | `Laya_ReadLayaAsset` | 用 `Read` 后手动解析 |
| 编辑场景/预制体/材质 | `Laya_EditAsset` | 用 `Write` / `Edit` 直接写文件 |
| 创建场景 | `SceneManagement.saveAs` | 用 `Write` 创建 `.ls` 文件 |
| 创建预制体 | `PrefabManagement.create*` | 用 `Write` 创建 `.lh` 文件 |
| 保存场景 | `SceneManagement.save` | 直接写文件 |
| 资源管理（创建/移动/复制/删除） | `AssetManagement` 系列 | 直接文件系统操作 |
| 项目操作（运行/构建/设置） | `ProjectManagement` 系列 | — |
| 调试日志 | `DebugManagement` 系列 | — |

### 添加脚本组件流程

1. 使用 `Write` 创建 `.ts` 脚本文件（这是唯一允许直接写文件的场景）
2. 调用 `AssetManagement.waitAssetBusy` 等待资源刷新
3. 调用 `SceneManagement.listComponents` 确认脚本已注册并获取 UUID
4. 使用 `Laya_EditAsset` 将组件添加到节点，`_$type` 填脚本 UUID：
    ```json
    {
        "op": "add",
        "path": "/节点路径/_$comp",
        "value": "[{\"_$type\":\"脚本UUID\"}]"
    }
    ```

---

## 五、`_$` 特殊字段名注意事项

LayaAir 资源文件使用 `_$` 前缀的特殊字段名。MCP 返回数据可能丢失下划线（`_$type` 变成 `$type`），这是传输层问题。编辑资源文件或生成 JSON 时始终使用 `_$` 前缀：

| 正确       | 错误      |
| ---------- | --------- |
| `_$type`   | `$type`   |
| `_$id`     | `$id`     |
| `_$child`  | `$child`  |
| `_$prefab` | `$prefab` |
| `_$comp`   | `$comp`   |
| `_$ref`    | `$ref`    |

---

## 六、参考资料

当需要了解场景/预制体 JSON 数据文件的详细格式规范（节点对象、组件对象、资源引用、新版 UI 类型说明等），请阅读 `references/scene-data-format.md`。该文档包含：

- 所有 `_$` 指令型键的完整说明
- 节点和组件的类型速查表
- 资源引用、节点引用、组件引用的 JSON 格式
- 2D/3D 混合场景层级约定
- 新版 UI 行为组件的设计模式与最佳实践
