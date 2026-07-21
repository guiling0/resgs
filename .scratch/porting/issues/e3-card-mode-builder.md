# E3 — CardBuilder + ModeBuilder

**What to build:** `CardBuilder` 注册卡牌基本数据（花色点数）到 `sgs.cards`/`sgs.carddatas`。`ModeBuilder` 注册游戏模式到 `sgs.modes`。

**Blocked by:** E1（可与 E2 并行）

**Status:** ✅ completed

- [x] `CardBuilder` 类：`.name()`、`.type()`、`.subtype()`、`.suit()`、`.number()`、`.damage()`、`.recover()`、`.register()` → 写入 `sgs.cards` + `sgs.carddatas`
- [x] `.register()` 幂等
- [x] `ModeBuilder` 类：`.name()`、`.cards(extNames[])`、`.generals(extNames[])`、`.settings()`、`.register()` → 写入 `sgs.modes`
- [x] `.register()` 幂等
- [x] `registerCore` 中暴露 `CardBuilder` + `ModeBuilder`
- [x] 验证：Builder → register → `sgs.carddatas.get('sha')` 非空 + `sgs.modes.get('standard')` 非空
- [x] 现有测试无回归
