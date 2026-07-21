# C0-02 — 加载器 + App 入口

**What to build:** `loader.ts` 线性进度条（步骤 stub），`main.ts` App 单例骨架，加载完成后进入就绪状态。

**Blocked by:** C0-01

**Status:** ready-for-agent

- [ ] `loader.ts`：加权步骤数组（字体/图集/Spine/扩展/初始化，C0 均为空 stub），进度条 + 文字更新
- [ ] 加载完成后 `#loader` 隐藏
- [ ] `main.ts`：App 单例，`App.start()` 入口（C0 仅打印就绪日志）
- [ ] 浏览器打开 → 进度条走完 → 控制台输出就绪日志
