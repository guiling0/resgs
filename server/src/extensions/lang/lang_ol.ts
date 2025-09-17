sgs.GeneralSetting('olex.xusheng', {
    title: '江东的铁壁',
    id: 'WU020',
    designer: 'Loun老萌',
    cv: '金垚',
    painter: '铁杵文化',
    script: '归零',
    image_url: 'generals/xusheng/olex.xusheng/image',
    death_audio: '盛只恨，不能再为主公，破敌致胜了……',
    skills: {
        ['olex.xusheng.pojun']: {
            name: '破军',
            desc: '当你使用【杀】指定目标后，你可以将其至多X张牌（X为其体力值）移出游戏直至回合结束。当你使用【杀】对手牌数与装备区里的牌数均不大于你的目标[4]角色造成伤害时，此伤害+1。',
            desc2: '①当【杀】指定目标后，若使用者为你，你可将此目标对应的角色的至多X张牌扣置于其武将牌旁（均称为“军”）（X为其体力值）▶（→）此回合结束前❶，该角色获得其武将牌旁的所有“军”。\n②当你对一名角色造成渠道为【杀】的伤害时❶，若你的手牌数和装备区里的牌数均不小于该角色，你令伤害值+1。',
            audios: [
                {
                    url: 'generals/xusheng/olex.xusheng/pojun1',
                    lang: '犯大吴疆土者，盛必击而破之！',
                },
                {
                    url: 'generals/xusheng/olex.xusheng/pojun2',
                    lang: '若敢来犯，必叫你大败而归！',
                },
            ],
        },
    },
});

export {};
