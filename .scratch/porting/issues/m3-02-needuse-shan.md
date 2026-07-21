# M3-02 — needUseCard 接入 + 闪响应闭环

**What to build:** `EventManager.trigger()` 接入 needUseCard 步骤——扫描 `sgs.carduses` 中匹配当前时机的卡牌，询问合法玩家是否使用。注册闪 CardUse（EffectBefore 时机，目标是牌）。`UseCardEvent` 实现 `responseTo` 分支（无 assign/become 段，offset 被响应的牌）。

**Blocked by:** M3-01

**Status:** ready-for-agent

- [ ] `EventManager.trigger(timing)` 增加 needUseCard 步骤：遍历 carduses → 检测合法性 → 创建 UseCardEvent
- [ ] 闪 CardUse 注册：`{ name: 'shan', timing: EffectBefore, target: [] }`
- [ ] `UseCardEvent` 新增 `responseTo?: VirtualCard` 字段，非空时跳过 DeclareAfter~BecomeTargetAfter + 目标列表为空
- [ ] 闪的效果 = offset 被响应的杀（UseCardOffset 时机生成）
- [ ] 验证：出杀→目标出闪→杀被 offset→无伤害
- [ ] 验证：出杀→目标不出闪→正常掉血（无响应路径不变）
- [ ] 验证：闪作为使用（目标是牌）不经过 AssignTarget 段
- [ ] M2 杀/桃验收测试无回归
