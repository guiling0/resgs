# Issue tracker：本地 Markdown

本仓库的 issue 和 spec（也称 PRD）以 Markdown 文件形式存放在 `.scratch/` 下。

## 约定

- 每个 feature 一个目录：`.scratch/<feature-slug>/`
- spec 为 `.scratch/<feature-slug>/spec.md`
- 实现类 issue 每张工单一个文件：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号——绝不使用单个合并的 tickets 文件
- 分诊状态记录在每个 issue 文件顶部附近的 `Status:` 行
- 评论与讨论历史追加到文件底部的 `## Comments` 标题下

## 当技能要求"publish to the issue tracker"

在 `.scratch/<feature-slug>/` 下创建新文件（目录不存在则先创建）。

## 当技能要求"fetch the relevant ticket"

读取所引用路径的文件。用户通常会直接给出路径或 issue 编号。

## Wayfinding 操作

供 `/wayfinder` 使用。**map** 是一个文件，每张工单对应一个 **child** 文件。

- **Map**：`.scratch/<effort>/map.md` —— 包含 Notes / Decisions-so-far / Fog 正文
- **Child ticket**：`.scratch/<effort>/issues/NN-<slug>.md`，从 `01` 编号，正文写问题。`Type:` 行记录工单类型（`research`/`prototype`/`grilling`/`task`）；`Status:` 行记录 `claimed`/`resolved`
- **Blocking**：文件顶部附近的 `Blocked by: NN, NN` 行。所列文件全部 `resolved` 时解除阻塞
- **Frontier**：扫描 `.scratch/<effort>/issues/` 中开放、未阻塞、未认领的文件；编号最小者优先
- **Claim**：先设置 `Status: claimed` 并保存，再开始任何工作
- **Resolve**：在 `## Answer` 标题下追加答案，设置 `Status: resolved`，然后在 `map.md` 的 Decisions-so-far 中追加上下文指针
