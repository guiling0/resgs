/**
 * 奸雄——最简技能定义（验证 SkillBuilder 通过 sgs 全局可用）。
 * SkillBuilder.register() 当前仅返回数据，手动写入注册表。
 */
const data = new sgs.SkillBuilder('jianxiong').register();
if (!sgs.skills.has('jianxiong')) {
    sgs.skills.set('jianxiong', data);
}
