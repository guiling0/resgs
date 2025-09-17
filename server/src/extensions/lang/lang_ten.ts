sgs.GeneralSetting('chenshi', {
    title: '裨将可期',
    id: 'SHU117',
    designer: '绯瞳',
    cv: '未知',
    painter: '游漫美绘',
    script: '归零',
    death_audio: '丞相，丞相！是魏延指使我的！',
    skills: {
        ['chenshi.qingbei']: {
            name: '擎北',
            desc: '每轮开始时，你可以选择任意种花色令你本轮不能使用。当你使用一张手牌后，你摸X张牌（X为本轮〖擎北〗选择的花色数）。',
            desc2: '①一轮的第一个回合开始后❹，你可选择至少一种花色▶你于此轮内使用的对应的实体牌数为1的牌对应的实体牌不能是你以此法选择的花色的牌。\n②当牌使用结算结束后❸，若使用者为你且此牌对应的实体牌（曾）为你的一张手牌，你摸X张牌（X为你于此轮内因执行发动〖擎北①〗而选择的花色数）。',
            audios: [
                {
                    url: 'generals/chenshi/qingbei1',
                    lang: '待追上那司马懿，定教他没好果子吃！',
                },
                {
                    url: 'generals/chenshi/qingbei2',
                    lang: '身若不周，吾一人可作擎北之柱。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wumiao.luxun', {
    title: '释武怀儒',
    id: 'WU007',
    designer: '韩旭',
    cv: 'LXH(凌晨)',
    painter: '小新',
    script: '归零',
    image_url: 'generals/luxun/wumiao.luxun/image',
    death_audio: '此生清白，不为浊泥所染。',
    skills: {
        ['wumiao.luxun.xiongmu']: {
            name: '雄幕',
            desc: '每轮开始时，你可以将手牌摸至体力上限，然后将任意张牌洗入牌堆，从牌堆或弃牌堆中获得等量的点数为8的牌（这些牌本轮不计入你的手牌上限）。当你每回合第一次受到伤害时，若你的手牌数不大于体力值，此伤害-1。',
            desc2: '①一轮的第一个回合开始后❹，你可将手牌补至X张（X为你的体力上限）▶你可将至少一张牌随机置入牌堆▷你随机获得牌堆或弃牌堆里的等量的点数为8的牌（于此轮内均不计入手牌上限）。②当你受到伤害时❸，若你于当前回合内发动过此技能的次数小于1且你于当前回合内未受到过伤害且你的手牌数不大于你的体力值，你令伤害值-1。',
            audios: [
                {
                    url: 'generals/luxun/wumiao.luxun/xiongmu1',
                    lang: '步步为营者，定无后顾之虞。',
                },
                {
                    url: 'generals/luxun/wumiao.luxun/xiongmu2',
                    lang: '明公彀中藏龙卧虎，放之海内皆可称贤。',
                },
            ],
        },
        ['wumiao.luxun.zhangcai']: {
            name: '彰才',
            desc: '当你使用或打出点数为8的牌时，你可以摸X张牌（X为你的手牌中点数为8的牌数且至少为1）。',
            desc2: '当牌被使用/打出时，若使用/打出者为你且此牌的点数为8，你可摸X张牌（X=max{你的点数为8的手牌数,1}）。',
            audios: [
                {
                    url: 'generals/luxun/wumiao.luxun/zhangcai1',
                    lang: '今提墨笔绘乾坤，湖海添色山永春。',
                },
                {
                    url: 'generals/luxun/wumiao.luxun/zhangcai2',
                    lang: '手提玉剑斥千军，昔日锦鲤化金龙。',
                },
            ],
        },
        ['wumiao.luxun.ruxian']: {
            name: '儒贤',
            desc: '限定技，出牌阶段，你可以令“彰才”改为所有点数均可触发摸牌直到你的下回合开始。',
            desc2: '限定技，出牌阶段，你可获得1枚“贤”▶你的〖彰才〗于你的下回合开始之前改为{ 当牌被使用/打出时，若使用/打出者为你，你可摸X张牌（X=max{你的点数与此牌相同的手牌数,1}） }。',
            audios: [
                {
                    url: 'generals/luxun/wumiao.luxun/ruxian1',
                    lang: '儒道尚仁而有礼，贤者知命而独悟。',
                },
                {
                    url: 'generals/luxun/wumiao.luxun/ruxian2',
                    lang: '儒门有言，仁为己任，此生不负孔孟之礼。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wumiao.luxun', {
    title: '奇峰厄川',
    id: 'WEI015',
    designer: '未知',
    cv: '未知',
    painter: '黯荧岛工作室',
    script: '归零',
    image_url: 'generals/dengai/tenmou.dengai/image',
    death_audio: '此处，名三造亭。',
    skills: {
        ['tenmou.dengai.zhouxi']: {
            name: '骤袭',
            desc: '出牌阶段限一次，你可以弃置所有当前不能指定其他角色为目标的手牌，然后依次选择弃牌数项：\n1.本回合与其他角色的距离-X；\n2.视为对至多X名角色使用一张【顺手牵羊】；\n3.视为对至多X名角色使用一张【杀】（X为此选项被选择的次序）。\n若你执行了所有选项，此技能视为未发动过。',
            desc2: '',
            audios: [
                {
                    url: 'generals/dengai/tenmou.dengai/zhouxi1',
                    lang: '不战胜，毋宁死。',
                },
                {
                    url: 'generals/dengai/tenmou.dengai/zhouxi2',
                    lang: '疾风卷赤帜，山雨摧危楼。',
                },
            ],
        },
        ['tenmou.dengai.shijin']: {
            name: '恃矜',
            desc: '当你使用或打出点数为8的牌时，你可以摸X张牌（X为你的手牌中点数为8的牌数且至少为1）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/dengai/tenmou.dengai/shijin1',
                    lang: '哈哈哈哈，灭国擒主之功，古来几人？',
                },
                {
                    url: 'generals/dengai/tenmou.dengai/shijin2',
                    lang: '天下鼎立久矣，今吾折其一足！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xing.caoren', {
    title: '伏波四方',
    id: 'WEI011',
    designer: '未知',
    cv: '王教授就是王宇航',
    painter: '君恒文化',
    script: '归零',
    image_url: 'generals/caoren/xing.caoren/image',
    death_audio: '濡须之败，此生之耻。',
    skills: {
        ['xing.caoren.sujun']: {
            name: '肃军',
            desc: '当你使用牌时，若你手牌中基本牌与非基本牌的数量相等，你可以摸两张牌。',
            desc2: '当牌被使用时，若使用者为你且你手牌区里的基本牌数等于不为基本牌的牌数，你可摸两张牌。',
            audios: [
                {
                    url: 'generals/caoren/xing.caoren/sujun1',
                    lang: '将为军魂，需以身作则。',
                },
                {
                    url: 'generals/caoren/xing.caoren/sujun2',
                    lang: '整肃三军，可育虎贲。',
                },
            ],
        },
        ['xing.caoren.lifeng']: {
            name: '砺锋',
            desc: '你可以将一张本回合所有角色均未使用过的颜色的手牌当不计入次数的【杀】或【无懈可击】使用。',
            desc2: '当你需要使用【杀】/【无懈可击】时❸，你可使用对应的实体牌为你的一张不为{于此回合内被使用过的所有牌的颜色}的手牌的普【杀】/普【无懈可击】。\n◆你因执行〖砺锋〗的效果而使用的【杀】不计入限制的次数。',
            audios: [
                {
                    url: 'generals/caoren/xing.caoren/lifeng1',
                    lang: '锋出百砺，健卒亦如是。',
                },
                {
                    url: 'generals/caoren/xing.caoren/lifeng2',
                    lang: '强军者，必校之以三九，练之三伏。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('sunchen', {
    title: '凶竖盈溢',
    id: 'WU122',
    designer: '朔方的雪',
    cv: '云中亭曲',
    painter: '君恒文化',
    script: '归零',
    death_audio: '臣家火起，请离席救之。',
    skills: {
        ['sunchen.zigu']: {
            name: '自固',
            desc: '出牌阶段限一次，你可以弃置一张牌，然后获得场上一张装备牌。若你未因此获得其他角色的牌，你摸一张牌。',
            desc2: '出牌阶段限一次，你可弃置一张牌并选择一名角色▶你获得其装备区里的一张牌。若你此次未以此法得到其他角色的牌，你摸一张牌。',
            audios: [
                {
                    url: 'generals/sunchen/zigu1',
                    lang: '卿有成材良木，可妆吾家江山。',
                },
                {
                    url: 'generals/sunchen/zigu2',
                    lang: '吾好锦衣玉食，卿家可愿割爱否？',
                },
            ],
        },
        ['sunchen.zuowei']: {
            name: '作威',
            desc: '当你于回合内使用牌时，若你的手牌数：大于X，你可以令此牌不能被响应；等于X，你可以对一名其他角色造成1点伤害；小于X，你可以摸两张牌，然后本回合此选项失效（X为你装备区里牌的数量且至少为1）。',
            desc2: '当牌于回合内被使用时，若使用者为你且你的手牌数：大于X，你可令所有角色均不能响应此牌；等于X，你可选择一名其他角色并对其造成1点普通伤害；小于X且你于此回合内未因执行此技能的效果而得到过牌，你可摸两张牌。（X=max{你装备区里的牌数,1}）',
            audios: [
                {
                    url: 'generals/sunchen/zuowei1',
                    lang: '不顺我意者，当填在野之壑。',
                },
                {
                    url: 'generals/sunchen/zuowei2',
                    lang: '吾令不从者，当膏霜锋之锷。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xizhicai', {
    title: '负俗的夭才',
    id: 'WEI055',
    designer: '荼蘼',
    cv: 'REAL-Jason(曹真）',
    painter: '眉毛子',
    script: '归零',
    death_audio: '臣家火起，请离席救之。',
    skills: {
        ['xizhicai.tiandu']: {
            name: '天妒',
            desc: '当你的判定牌生效后，你可以获得此牌。',
            desc2: '当你进行的判定结果确定后❷，你可获得判定牌。',
            audios: [
                {
                    url: 'generals/xizhicai/tiandu1',
                    lang: '天意不可逆。',
                },
                {
                    url: 'generals/xizhicai/tiandu2',
                    lang: '既是如此……',
                },
            ],
        },
        ['xizhicai.xianfu']: {
            name: '先辅',
            desc: '锁定技，游戏开始时，你选择一名其他角色，当其受到伤害后，若其存活，你受到等量的无来源普通伤害，当其回复体力后，你回复等量的体力。',
            desc2: '锁定技，游戏的第一个回合开始后❸，你令一名其他角色（对所有其他角色均不可见）获得1枚“弼”▶（→）当其受到伤害后，若其存活，你受到X点无来源的普通伤害（X为其此次受到的伤害的伤害值）；当其回复体力后，你回复Y点体力（Y为其此次回复的体力点数）。',
            audios: [
                {
                    url: 'generals/xizhicai/xianfu1',
                    lang: '辅佐明君，从一而终。',
                },
                {
                    url: 'generals/xizhicai/xianfu2',
                    lang: '吾于此生，竭尽所能。',
                },
                {
                    url: 'generals/xizhicai/xianfu3',
                    lang: '春蚕至死，蜡炬成灰。',
                },
                {
                    url: 'generals/xizhicai/xianfu4',
                    lang: '愿为主公，尽我所能。',
                },
                {
                    url: 'generals/xizhicai/xianfu5',
                    lang: '赠人玫瑰，手有余香。	',
                },
                {
                    url: 'generals/xizhicai/xianfu6',
                    lang: '主公之幸，我之幸也。',
                },
            ],
        },
        ['xizhicai.chouce']: {
            name: '筹策',
            desc: '当你受到1点伤害后，你可以判定，若结果为：黑色，你弃置一名角色区域里的一张牌；红色，你选择一名角色，其摸一张牌，若其是〖先辅〗选择的角色，改为其摸两张牌。',
            desc2: '当你受到1点伤害后，你可判定▶若结果为：黑色，你弃置一名角色的区域里的一张牌；红色，{你选择：1.令一名没有“弼”的角色摸一张牌；2. 令一名有“弼”的角色摸两张牌}。',
            audios: [
                {
                    url: 'generals/xizhicai/chouce1',
                    lang: '一筹一划，一策一略。',
                },
                {
                    url: 'generals/xizhicai/chouce2',
                    lang: '主公之忧，吾之所思也。',
                },
            ],
        },
    },
});

export {};
