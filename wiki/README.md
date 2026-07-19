# Wiki 资料站

展示游戏中的所有卡牌与武将数据。纯 HTML/CSS/JS，零框架依赖。

- **数据来源**: `shared/datas/` 下的 JSON 文件（卡牌、武将、技能、翻译）
- **运行方式**: `npm run serve` → `http://localhost:3000`

## 页面

| 页面 | 说明 |
|---|---|
| `#home` | 首页（统计数据 + 快速链接） |
| `#cards` | 卡牌（按名/按包，搜索筛选） |
| `#generals` | 武将（搜索 + 拼音 + ID + 多选筛选：势力/性别/扩展包/子包） |
| `#editor` | 武将编辑器（可视化表单 → 生成 JSON） |

## 技术架构

- 纯 JavaScript（ES5 兼容）+ CSS 变量 + HTML
- Hash-based SPA 路由（`hashchange` 事件）
- 轻量 `el()` DOM 构建函数（类 React.createElement）
- 数据通过 `scripts/build-data.cjs` 从 `shared/datas/` 预处理为 JS 文件
- 资源路径使用 CDN（`http://res.resgs.com/`）

## 常用命令

```bash
cd wiki

# 重新生成数据（shared/datas 更新后）
npm run build-data

# 启动开发服务器
npm run serve        # → http://localhost:3000
```

## 设计约束

- 不依赖外部 JS/CSS 框架
- `scripts/build-data.cjs` 使用 Node.js CommonJS
- 不与新项目代码耦合——wiki 是独立项目，只读取 `shared/datas/` 作为数据源
