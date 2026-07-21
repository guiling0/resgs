# M3-01 — canUseCard 参数改为 VirtualCardData

**What to build:** `canUseCard` 参数从 `string | VirtualCard` 改为 `string | VirtualCardData`。`VirtualCardManager` 新增 `createData()` 工具方法。

**Blocked by:** None — 可立即开始

**Status:** ready-for-agent

- [x] `canUseCard(player, cardNameOrVCData, target?, opts?)` 签名改为接受 `VirtualCardData`
- [x] `VirtualCardManager.createData(name, cards)` → 构造 `VirtualCardData`
- [x] 现有 M2 杀/桃验收测试通过（不修改已验证路径）
- [x] 验证：`vcard.createData('sha', [card])` → `canUseCard(player, data)` 正确返回
