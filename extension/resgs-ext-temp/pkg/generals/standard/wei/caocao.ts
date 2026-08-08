/**
 * 曹操 + 奸雄
 * 一个文件 = 一张武将牌的全部信息 + 技能定义
 */

sgs.SkillBuilder('jianxiong').register();

sgs.EffectBuilder('jianxiong')
    .on(sgs.TimingName.DamageCauseAfter)
    .can_trigger((room, player, data) => {
        return;
    });

export const caocao = sgs.createGeneral({
    name: 'caocao',
    kingdom: 'wei',
    hp: 4,
    gender: sgs.Gender.Male,
    skills: ['jianxiong'],
    lord: true,
});
