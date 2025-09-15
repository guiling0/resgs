sgs.GeneralSetting('wars.caohong', {
    title: '魏之福将',
    rs: '曹仁',
    death_audio: '曹公，可安好……',
    skills: {
        ['wars.caohong.huyuan']: {
            name: '护援',
            desc: '结束阶段，你可以将一张装备牌置入一名角色的装备区，然后你可以弃置该角色距离为1的一名角色的区域里的一张牌。',
            desc2: '结束阶段开始时，你可将一张装备牌置入一名角色的装备区▶你可弃置其距离为1的一名角色区域里的一张牌',
            audios: [
                {
                    url: 'generals/caohong/huyuan1',
                    lang: '拼将性命，也要保将军周全！',
                },
                {
                    url: 'generals/caohong/huyuan2',
                    lang: '舍命献马，护我曹公！',
                },
            ],
        },
        ['wars.caohong.heyi']: {
            name: '鹤翼',
            desc: '阵法技，你和与你处于同一队列的其他角色视为拥有技能“飞影”。',
            desc2: '阵法技，你和与你处于同一队列的其他角色拥有〖飞影〗。',
        },
        ['wars.caohong.feiying']: {
            name: '飞影',
            desc: '锁定技，其他角色计算与你的距离+1.',
            desc2: '锁定技，其他角色至你的距离+1。',
        },
    },
});

sgs.GeneralSetting('wars.dengai', {
    title: '矫然的壮士',
    rs: '',
    death_audio: '君不知臣，臣不知君，罢了，罢了……',
    skills: {
        ['wars.dengai.tuntian']: {
            name: '屯田',
            desc: '当你于回合外失去牌时，你可以进行一次判定，若结果不为红桃，你可以将此判定牌置于你的武将牌上，称为“田”（你计算与其他角色的距离时减少“田”的数量）。',
            desc2: '①当你于回合外失去牌后❷，你可判定▶若结果不为红桃，你可将弃牌堆里的此判定牌置于武将牌上（称为“田”）。②你至其他角色的距离-X（X 为“田”数）。',
            audios: [
                {
                    url: 'generals/dengai/tuntian1',
                    lang: '留得良田在，何愁不破敌。',
                },
                {
                    url: 'generals/dengai/tuntian2',
                    lang: '积谷于此，以制四方。',
                },
            ],
        },
        ['wars.dengai.jixi']: {
            name: '急袭',
            desc: '主将技，你计算体力上限时减少1个单独的阴阳鱼。\n你可以将一张“田”当【顺手牵羊】使用。',
            desc2: '①主将技，奥秘技，当你选择体力牌时，此武将牌上的单独阴阳鱼个数-1。②主将技，当你需要使用【顺手牵羊】时❸，你可使用对应的实体牌为一张“田”的【顺手牵羊】。\n◆此实体牌不会作为〖屯田②〗中的“田”令你至其他角色的距离-1。',
            audios: [
                {
                    url: 'generals/dengai/jixi1',
                    lang: '谁占到先机，谁就胜了。',
                },
                {
                    url: 'generals/dengai/jixi2',
                    lang: '哪里走！',
                },
            ],
        },
        ['wars.dengai.ziliang']: {
            name: '资粮',
            desc: '副将技，当一名与你势力相同的角色受到伤害后，你可以将一张“田”交给该角色。',
            desc2: '副将技，当一名角色受到伤害后，若其与你势力相同，你可将一张“田”交给该角色。',
            audios: [
                {
                    url: 'generals/dengai/ziliang1',
                    lang: '兵，断不可无粮啊。',
                },
                {
                    url: 'generals/dengai/ziliang2',
                    lang: '吃饱了，才有力气为国效力！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.jiangwei', {
    title: '龙的衣钵',
    rs: '诸葛亮·迟暮的丞相',
    death_audio: '臣等正欲死战，陛下何故先降……',

    skills: {
        ['wars.jiangwei.tiaoxin']: {
            name: '挑衅',
            desc: '出牌阶段限一次，你可以令一名攻击范围内含你的其他角色选择一项：\n1.对你使用一张【杀】；\n2.令你弃置其一张牌。',
            desc2: '出牌阶段限一次，你可获得1枚“挑”并选择攻击范围内有你的一名角色▶其需对包括你在内的角色使用【杀】，否则你弃置其一张牌。',
            audios: [
                {
                    url: 'generals/jiangwei/tiaoxin1',
                    lang: '小小娃娃，乳臭未干。',
                },
                {
                    url: 'generals/jiangwei/tiaoxin2',
                    lang: '快滚回去，叫你主将出来。',
                },
            ],
        },
        ['wars.jiangwei.tianfu']: {
            name: '天覆',
            desc: '主将技，阵法技，若当前回合角色处于同一队列，你视为拥有“看破”。',
            desc2: '主将技，阵法技，若当前回合角色为所在队列里的角色，你拥有〖看破〗。',
            audios: [],
        },
        ['wars.jiangwei.yizhi']: {
            name: '遗志',
            desc: '副将技，你计算体力上限时减少1个单独的阴阳鱼。\n若你的主将拥有技能“观星”，则将其描述中的X改为5，否则你视为拥有技能“观星”。',
            desc2: '①副将技，奥秘技，当你选择体力牌时，此武将牌上的单独阴阳鱼个数-1。②副将技，若你：因主将的武将牌上有〖观星〗而拥有〖观星〗且主将的武将牌处于明置状态，此〖观星〗改为{ 准备阶段开始时，你可将牌堆顶的五张牌扣置入处理区（对你可见）▶你将其中任意数量的牌置于牌堆顶，将其余的牌置于牌堆底 }；没有〖观星〗或主将的武将牌处于暗置状态，你拥有〖观星〗。',
            audios: [],
        },
        ['wars.jiangwei.guanxing']: {
            name: '观星',
            desc: '准备阶段，你可以观看牌堆顶的X张牌（X为全场角色数且最多为5），然后将这些牌以任意顺序放置于牌堆顶或牌堆底。',
            desc2: '准备阶段开始时，你可将牌堆顶的X张牌（X=min{角色数,5}）扣置入处理区（对你可见）▶你将其中任意数量的牌置于牌堆顶，将其余的牌置于牌堆底。',
            audios: [
                {
                    url: 'generals/jiangwei/yizhi1',
                    lang: '天文地理，丞相所教。维，铭记于心。',
                },
                {
                    url: 'generals/jiangwei/yizhi2',
                    lang: '哪怕只有一线生机，我也不会放弃。',
                },
            ],
        },
        ['wars.jiangwei.kanpo']: {
            name: '看破',
            desc: '你可以将一张黑色手牌当【无懈可击】使用。',
            desc2: '当你需要使用普【无懈可击】时❸，你可使用对应的实体牌为你的一张黑色手牌的普【无懈可击】。',
            audios: [
                {
                    url: 'generals/jiangwei/tianfu1',
                    lang: '丞相已教我识得此计。',
                },
                {
                    url: 'generals/jiangwei/tianfu2',
                    lang: '哼，有破绽。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.jiangwanfeiyi', {
    title: '社稷股肱',
    rs: '诸葛亮·迟暮的丞相',
    image_self_url: 'generals/jiangwanfeiyi/image',
    death_audio: '墨守成规，终为其害啊……',
    skills: {
        ['wars.jiangwanfeiyi.shengxi']: {
            name: '生息',
            desc: '弃牌阶段开始时，若你本回合没有造成过伤害，你可以摸两张牌。',
            desc2: '弃牌阶段开始时，若你于此回合内未造成过伤害，你可摸两张牌。',
            audios: [
                {
                    url: 'generals/jiangwanfeiyi/shengxi1',
                    lang: '国之生计，在民生息。',
                },
                {
                    url: 'generals/jiangwanfeiyi/shengxi2',
                    lang: '安民止战，兴汉室！',
                },
            ],
        },
        ['wars.jiangwanfeiyi.shoucheng']: {
            name: '守成',
            desc: '当一名与你势力相同的角色于其回合外失去最后的手牌时，你可以令其摸一张牌。',
            desc2: '当至少一名角色于他们的回合外失去手牌后❷，你可令其中与你势力相同且没有手牌的角色摸一张牌。',
            audios: [
                {
                    url: 'generals/jiangwanfeiyi/shoucheng1',
                    lang: '国库盈余，可助军威！',
                },
                {
                    url: 'generals/jiangwanfeiyi/shoucheng2',
                    lang: '待吾等助将军一臂之力！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.xusheng', {
    title: '江东的铁壁',
    rs: '丁奉',
    death_audio: '可怜一身胆略，皆随一抔黄土……',
    skills: {
        ['wars.xusheng.yicheng']: {
            name: '疑城',
            desc: '当一名与你势力相同的角色成为【杀】的目标后，你可以令该角色摸一张牌，然后其弃置一张牌，若此牌为其手牌中的装备牌，其使用之。',
            desc2: '当一名角色成为【杀】的目标后，若其与你势力相同，你可令其摸一张牌▶其选择：1.弃置一张不为装备牌的手牌；2.使用对应的实体牌均为手牌的装备牌。',
            audios: [
                {
                    url: 'generals/xusheng/yicheng1',
                    lang: '不怕死，就尽管放马过来！',
                },
                {
                    url: 'generals/xusheng/yicheng2',
                    lang: '待末将布下疑城，以退曹贼。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.jiangqin', {
    title: '祁奚之器',
    rs: '周泰',
    death_audio: '竟……破我阵法……',
    skills: {
        ['wars.jiangqin.shangyi']: {
            name: '尚义',
            desc: '出牌阶段限一次，你可以令一名其他角色观看你的手牌，然后你选择一项：\n1.观看其手牌，并可以弃置其中的一张黑色牌；\n2.观看该角色所有暗置的武将牌。',
            desc2: '出牌阶段限一次，你可令一名其他角色观看你的手牌▶你选择：1.观看其手牌并可弃置其中的一张黑色牌；2.观看其所有暗置的武将牌。',
            audios: [
                {
                    url: 'generals/jiangqin/shangyi1',
                    lang: '大丈夫为人坦荡，看下手牌算什么！',
                },
                {
                    url: 'generals/jiangqin/shangyi2',
                    lang: '敌情已了然于胸，即刻出发。',
                },
            ],
        },
        ['wars.jiangqin.niaoxiang']: {
            name: '鸟翔',
            desc: '阵法技，当你使用【杀】指定不处于队列的相邻角色为目标后，或与你处于同一围攻关系的另一名围攻角色使用【杀】指定被围攻角色为目标后，该角色需连续使用两张【闪】才能抵消。',
            desc2:
                '①阵法技，当【杀】指定目标后，若使用者为你且此目标对应的角色与你相邻且其不是任何队列里的角色，你将此目标对应的角色抵消此【杀】的方式改为依次使用两张【闪】。②阵法技，当【杀】指定目标后，若使用者是你为围攻角色的围攻关系中的一名围攻角色且此目标对应的角色是此围攻关系中的被围攻角色，使用者将此目标对应的角色抵消此【杀】的方式改为依次使用两张【闪】。\n' +
                '◆目标角色使用的第一张【闪】的效果改为没有效果，若此【闪】对此【杀】无效，其不能使用第二张【闪】。',
            audios: [
                {
                    url: 'generals/jiangqin/niaoxiang1',
                    lang: '此战，必是有死无生！',
                },
                {
                    url: 'generals/jiangqin/niaoxiang2',
                    lang: '抢占先机，占尽优势！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.hetaihou', {
    title: '弄权之蛇蝎',
    death_audio: '你们男人造的孽，非要说什么红颜祸水……',
    skills: {
        ['wars.hetaihou.zhendu']: {
            name: '鸩毒',
            desc: '其他角色的出牌阶段开始时，你可以弃置一张手牌，令该角色视为使用一张【酒】，然后你对其造成1点伤害。',
            desc2: '其他角色的出牌阶段开始时，若其存活，你可弃置一张手牌▶其使用无对应的实体牌的【酒】（使用方法①）▷你对其造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/hetaihou/zhendu1',
                    lang: '怪只怪你，不该生有皇子！',
                },
                {
                    url: 'generals/hetaihou/zhendu2',
                    lang: '后宫之中，岂有你的位置！',
                },
            ],
        },
        ['wars.hetaihou.qiluan']: {
            name: '戚乱',
            desc: '一名角色的回合结束时，若你本回合杀死过角色，你可以摸三张牌。',
            desc2: '—名角色的回合结束前❶，若你于此回合内杀死过角色，你可摸三张牌。',
            audios: [
                {
                    url: 'generals/hetaihou/qiluan1',
                    lang: '待我召吾兄入宫，谁敢不从？',
                },
                {
                    url: 'generals/hetaihou/qiluan2',
                    lang: '本后自由哥哥在外照应，有什么好担心的！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.yuji', {
    title: '魂绕左右',
    rs: '左慈',
    death_audio: '幻化之物，终是算不得真呐……',
    skills: {
        ['wars.yuji.qianhuan']: {
            name: '千幻',
            desc: '当一名与你势力相同的角色受到伤害后，你可亮出牌堆顶的一张牌并置于你的武将牌上，称为“幻”，若此牌与其他“幻”花色相同，则将此牌置入弃牌堆。\n当一名与你势力相同的角色成为基本牌或锦囊牌的唯一目标时，你可将“幻”置入弃牌堆，然后取消此目标。',
            desc2: '①当一名角色受到伤害后，若其与你势力相同且其存活，你可将牌堆顶的一张牌置于武将牌上（称为“幻”）▶若此“幻”与其他“幻”中的一张花色相同，你将此“幻”置入弃牌堆。②当一名角色成为基本牌或普通锦囊牌的目标时，若其与你势力相同且目标对应的角色数为1，你可将一张“幻”置入弃牌堆▶你取消此目标。③当延时锦囊牌对应的实体牌移至一名角色的判定区前❷，若其与你势力相同，你可将一张“幻”置入弃牌堆▶你将此次移动的目标区域改为弃牌堆。',
            audios: [
                {
                    url: 'generals/yuji/qianhuan1',
                    lang: '幻化于阴阳，藏匿于乾坤。',
                },
                {
                    url: 'generals/yuji/qianhuan2',
                    lang: '幻变迷踪，虽飞鸟亦难觅踪迹！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lidian', {
    title: '深明大义',
    rs: '乐进',
    death_audio: '报国杀敌，虽死犹荣……',
    skills: {
        ['wars.lidian.xunxun']: {
            name: '恂恂',
            desc: '摸牌阶段开始时，你可以观看牌堆顶的四张牌，然后将其中的两张牌置于牌堆顶，将其余的牌置于牌堆底。',
            desc2: '摸牌阶段开始时❷，你可将牌堆顶的四张牌扣置入处理区（对你可见）▶你将其中两张牌置于牌堆顶，将其余的牌置于牌堆底。',
            audios: [
                {
                    url: 'generals/lidian/xunxun1',
                    lang: '众将死战，非吾之功。',
                },
                {
                    url: 'generals/lidian/xunxun2',
                    lang: '爱兵如子，胜乃可全。',
                },
            ],
        },
        ['wars.lidian.wangxi']: {
            name: '忘隙',
            desc: '当你对其他角色造成伤害后，或受到其他角色造成的伤害后，你可以与该角色各摸一张牌。',
            desc2: '当你对其他角色造成伤害后，或受到其他角色造成的伤害后，若其存活，你可令你与其各摸一张牌。',
            audios: [
                {
                    url: 'generals/lidian/wangxi1',
                    lang: '大丈夫何拘小节。',
                },
                {
                    url: 'generals/lidian/wangxi2',
                    lang: '前尘往事，莫再提起。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zangba', {
    title: '节度青徐',
    rs: '张辽',
    death_audio: '断刃沉江，负主重托……',
    skills: {
        ['wars.zangba.renxia']: {
            name: '捍御',
            desc: '出牌阶段限一次，你可以将一张黑桃手牌当【铁索连环】使用，若如此做，你横置。',
            desc2: '当你需要使用【铁索连环】时❸，你可使用对应的实体牌为你的一张黑桃手牌的【铁索连环】▶系统进行此牌的使用流程。你横置。',
            audios: [
                {
                    url: 'generals/zangba/renxia1',
                    lang: '铁索横江，谅你插翅难逃！',
                },
                {
                    url: 'generals/zangba/renxia2',
                    lang: '江横索寒，阻敌绝境之中！',
                },
            ],
        },
        ['wars.zangba.hengjiang']: {
            name: '横江',
            desc: '当你受到属性伤害时，若你处于“连环状态”，则你可令处于“连环状态”的一名其他角色重置，然后若其与你势力不同，你移除其副将的武将牌。',
            desc2: '当你受到伤害时❸，若此伤害为属性伤害且你处于连环状态，你可获得1枚“横”并选择一名处于连环状态的其他角色▶其重置。若其与你势力不同，其移除副将的武将牌。',
            audios: [
                {
                    url: 'generals/zangba/hengjiang1',
                    lang: '狂妄，是需要代价的！',
                },
                {
                    url: 'generals/zangba/hengjiang2',
                    lang: '霸必奋勇杀敌，一雪夷陵之耻！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.madai', {
    title: '临危受命',
    rs: '马超',
    death_audio: '我怎么会死在这里……',
    skills: {
        ['wars.madai.mashu']: {
            name: '马术',
            desc: '锁定技，你计算与其他角色的距离-1。',
            desc2: '锁定技，你至其他角色的距离-1。',
            audios: [],
        },
        ['wars.madai.qianxi']: {
            name: '潜袭',
            desc: '准备阶段，你可以摸一张牌并弃置一张牌，令距离1的一名角色不能使用或打出与你弃置牌颜色相同的手牌直到本回合结束。',
            desc2: '准备阶段开始时，你可摸一张牌▶你弃置一张牌。距离为1的一名角色于此回合内使用或打出的牌对应的所有实体牌不能均是其手牌区里的与你以此法弃置的牌颜色相同的牌。',
            audios: [
                {
                    url: 'generals/madai/qianxi1',
                    lang: '喊什么喊，我敢杀你！',
                },
                {
                    url: 'generals/madai/qianxi2',
                    lang: '笑什么笑，叫你得意！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.mifuren', {
    title: '乱世沉香',
    rs: '',
    death_audio: '阿斗被救，妾身再无牵挂……',
    skills: {
        ['wars.mifuren.guixiu']: {
            name: '闺秀',
            desc: '当你明置此武将牌时，你可以摸两张牌；\n当你移除此武将牌时，你可以回复1点体力。',
            desc2: '①当你明置此武将牌后，你可摸两张牌。②当你移除此武将牌前❷，你可获得1枚“淑”▶（→）当你移除此武将牌后，你可回复1点体力。',
            audios: [
                {
                    url: 'generals/mifuren/guixiu1',
                    lang: '闺中女子，亦可秀气英拔。',
                },
                {
                    url: 'generals/mifuren/guixiu2',
                    lang: '闺楼独看花月，倚窗顾影自怜。',
                },
            ],
        },
        ['wars.mifuren.cunsi']: {
            name: '存嗣',
            desc: '出牌阶段，你可以移除此武将牌。若如此做，你令一名角色获得技能“勇决”。然后若非你获得“勇决”，该角色摸两张牌。',
            desc2: '①出牌阶段，若此武将牌处于暗置状态，你可获得1枚“明”。②出牌阶段，若此武将牌处于明置状态，你可移除此武将牌并选择一名角色▶其获得〖勇决〗。若其不为你，其摸两张牌。',
            audios: [
                {
                    url: 'generals/mifuren/cunsi1',
                    lang: '存汉室之嗣，留汉室之本。',
                },
                {
                    url: 'generals/mifuren/cunsi2',
                    lang: '一切便托付将军了！',
                },
            ],
        },
        ['wars.mifuren.yongjue']: {
            name: '勇决',
            desc: '当一名与你势力相同的角色于其出牌阶段内使用的第一张牌结算结束后，若此牌为【杀】，该角色可以获得之。',
            desc2: '当一名角色于其出牌阶段内使用的【杀】使用结算结束后❸，若其与你势力相同，且此【杀】为其于此阶段内使用过的第一张牌，你令其选择：1.可获得此【杀】对应的所有实体牌；2.弃1枚“决”。',
            audios: [
                {
                    url: 'generals/mifuren/yongjue1',
                    lang: '能救一个是一个！',
                },
                {
                    url: 'generals/mifuren/yongjue2',
                    lang: '辅幼主，成霸业！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.sunce', {
    title: '江东的小霸王',
    rs: '大乔、周瑜、太史慈',
    death_audio: '内事不决问张昭，外事不决问周瑜……',

    skills: {
        ['wars.sunce.jiang']: {
            name: '激昂',
            desc: '当你使用【决斗】或红色【杀】指定目标后，或成为【决斗】或红色【杀】的目标后，你可以摸一张牌。',
            desc2: '①当【决斗】或红色【杀】指定第一个目标后，若使用者为你，你可摸一张牌。②当你成为 【决斗】或红色【杀】的目标后，你可摸一张牌。',
            audios: [
                {
                    url: 'generals/sunce/jiang1',
                    lang: '江东子弟，何惧于天下！',
                },
                {
                    url: 'generals/sunce/jiang2',
                    lang: '吾乃江东小霸王孙伯符！',
                },
            ],
        },
        ['wars.sunce.yingyang']: {
            name: '鹰扬',
            desc: '当你拼点的牌亮出后，你可以令此牌的点数+3或-3（至少为A，至多为K）。',
            desc2: '当你拼点的牌亮出后，你可选择：1.令此牌的点数于此次拼点结算结束之前+3；2.令此牌的点数于此次拼点结算结束之前-3。',
            audios: [
                {
                    url: 'generals/sunce/yingyang1',
                    lang: '此战，我必取胜！',
                },
                {
                    url: 'generals/sunce/yingyang2',
                    lang: '相斗之趣，吾常胜之。',
                },
            ],
        },
        ['wars.sunce.hunshang']: {
            name: '魂殇',
            desc: '副将技，你计算体力上限时减少1个单独的阴阳鱼。\n准备阶段，若你的体力值为1，你本回合视为拥有技能“英姿”和“英魂”。',
            desc2: '①副将技，奥秘技，当你选择体力牌时，此武将牌上单独的阴阳鱼个数-1。②副将技，准备阶段开始时，若你的体力值为1，你于此回合内拥有〖英姿〗和〖英魂〗。',
            audios: [],
        },
        ['wars.sunce.yingzi']: {
            name: '英姿',
            desc: '锁定技，摸牌阶段，你多摸一张牌；你的手牌上限与你的体力上限相等。',
            desc2: '①锁定技，摸牌阶段，你令额定摸牌数+1。②锁定技，你的手牌上限为X（X为你的体力上限）。',
            audios: [
                {
                    url: 'generals/sunce/yingzi1',
                    lang: '尔等看好了！',
                },
                {
                    url: 'generals/sunce/yingzi2',
                    lang: '公瑾，助我决一死战。',
                },
            ],
        },
        ['wars.sunce.yinghun']: {
            name: '英魂',
            desc: '准备阶段，若你已受伤，你可以选择一名其他角色并选择一项：1.令其摸X张牌，然后弃置一张牌；2.令其摸一张牌，然后弃置X张牌。（X为你已损失的体力值）',
            desc2: '准备阶段开始时，若你已受伤，你可选择：1.{令一名其他角色获得1枚“魂”▶其摸X张牌，弃置一张牌}；2.{令一名其他角色获得1枚“魂”▶其摸一张牌，弃置X张牌}。（X为你已损失的体力值）',
            audios: [
                {
                    url: 'generals/sunce/yinghun1',
                    lang: '父亲，助我背水一战。',
                },
                {
                    url: 'generals/sunce/yinghun2',
                    lang: '孙氏英烈，庇佑江东！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.chenwudongxi', {
    title: '壮怀激烈',
    image_self_url: 'generals/chenwudongxi/image',
    death_audio: '杀身为主，死而无憾……',
    skills: {
        ['wars.chenwudongxi.duanxie']: {
            name: '断绁',
            desc: '准备阶段，你可以移除你另一张非君主武将牌，然后你跳过此回合的判定阶段并获得以下技能直到回合结束：“好施”、“激昂”、“制衡”、“苦肉”、“天义”。',
            desc2: '准备阶段开始时，若你有两张武将牌且另一张武将牌不为君主，你可发动此技能▶移除你的另一张武将。跳过此回合的额定的判定阶段。获得〖好施〗〖激昂〗〖制衡〗〖苦肉〗〖天义〗直到此回合结束。',
            audios: [
                {
                    url: 'generals/chenwudongxi/duanxie1',
                    lang: '不惜性命，也要保主公周全！',
                },
                {
                    url: 'generals/chenwudongxi/duanxie2',
                    lang: '东吴男儿，岂是贪生怕死之辈？',
                },
            ],
        },
        ['wars.chenwudongxi.fenming']: {
            name: '奋命',
            desc: '当你死亡时，你可以将任意名角色横置或重置。',
            desc2: '当你死亡时，你可选择至少一名其他角色▶这些角色依次选择：{1.若其处于连环状态，其重置；2.若其不处于连环状态，其横置}',
            audios: [
                {
                    url: 'generals/chenwudongxi/fenming1',
                    lang: '区区绳索，就想挡住吾等去路？',
                },
                {
                    url: 'generals/chenwudongxi/fenming2',
                    lang: '以身索敌，何惧同伤！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.dongzhuo', {
    title: '魔王',
    death_audio: '为何人人皆与我为敌……',
    skills: {
        ['wars.dongzhuo.hengzheng']: {
            name: '横征',
            desc: '摸牌阶段，若你的体力值为1或你没有手牌，你可以改为获得每名其他角色区域里的一张牌。',
            desc2: '摸牌阶段开始时❷，若你的体力值为1或你没有手牌，且有区域里有牌的其他角色，你可令额定摸牌数改为0并选择所有其他角色▶你获得这些角色各自区域里的一张牌。',
            audios: [
                {
                    url: 'generals/dongzhuo/hengzheng1',
                    lang: '老夫进京平乱，岂能空手而归？',
                },
                {
                    url: 'generals/dongzhuo/hengzheng2',
                    lang: '谁的，都是我的！',
                },
            ],
        },
        ['wars.dongzhuo.baoling']: {
            name: '暴凌',
            desc: '主将技，限定技，锁定技，出牌阶段结束时，若你副将有武将牌，移除你副将的武将牌，然后你加3点体力上限并回复3点体力，获得“崩坏”。',
            desc2: '主将技，限定技，锁定技，出牌阶段结束时，若此武将牌处于明置状态且你有副将，你移除副将的武将牌▶你加3点体力上限，回复3点体力，获得〖崩坏〗。',
            audios: [
                {
                    url: 'generals/dongzhuo/baoling1',
                    lang: '大丈夫，岂能妇人之仁？',
                },
                {
                    url: 'generals/dongzhuo/baoling2',
                    lang: '待吾大开杀戒！哈哈哈哈哈……',
                },
            ],
        },
        ['wars.dongzhuo.benghuai']: {
            name: '崩坏',
            desc: '锁定技，结束阶段，若你不是全场体力值最低的角色，你选择一项：\n1.失去1点体力；\n2.减1点体力上限。',
            desc2: '锁定技，结束阶段开始时，若你不是体力值最小的角色，你选择：\n1.失去1点体力；\n2.减1点体力上限。',
            audios: [
                {
                    url: 'generals/dongzhuo/benghuai1',
                    lang: '哎！我是不是该减肥了？',
                },
                {
                    url: 'generals/dongzhuo/benghuai2',
                    lang: '呃……',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zhangren', {
    title: '索命神射',
    rs: '',
    death_audio: '本将军败于诸葛，无憾……',
    skills: {
        ['wars.zhangren.chuanxin']: {
            name: '穿心',
            desc: '当你于出牌阶段内使用【杀】或【决斗】对与你势力不同的目标角色造成伤害时，若该角色副将有武将牌，你可以防止此伤害，然后令该角色选择一项：\n1.弃置装备区的所有牌，然后失去1点体力；\n2.移除其副将的武将牌。',
            desc2: '当你于出牌阶段内因执行你使用的【杀】或【决斗】的效果而对一名角色造成伤害时❷，若其与你势力不同或若你明置后会与其势力不同，且其有副将，你可防止此伤害▶其选择：1.弃置装备区里的所有牌▷其失去1点体力；2.移除副将的武将牌。',
            audios: [
                {
                    url: 'generals/zhangren/chuanxin1',
                    lang: '一箭穿心，哪里可逃！',
                },
                {
                    url: 'generals/zhangren/chuanxin2',
                    lang: '穿心之痛，细细品吧！呵哈哈哈。',
                },
            ],
        },
        ['wars.zhangren.fengshi']: {
            name: '锋矢',
            desc: '阵法技，当你使用【杀】指定不处于队列的相邻角色为目标后，或与你处于同一围攻关系的另一名围攻角色使用【杀】指定被围攻角色为目标后，该角色弃置装备区里的一张牌。',
            desc2: '①阵法技，当【杀】指定目标后，若使用者为你且此目标对应的角色与你相邻且其不是任何队列里的角色，你令此目标对应的角色弃置装备区里的一张牌。②阵法技，当【杀】指定目标后，若使用者是你为围攻角色的围攻关系中的一名围攻角色且此目标对应的角色是此围攻关系中的被围攻角色，使用者将此目标对应的角色弃置装备区里的一张牌。',
            audios: [
                {
                    url: 'generals/zhangren/fengshi1',
                    lang: '大军压境，还不卸甲受降！',
                },
                {
                    url: 'generals/zhangren/fengshi2',
                    lang: '放下兵器，饶你不死！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.bianfuren', {
    title: '奕世之雍容',
    rs: '曹操',
    death_audio: '子桓，兄弟之情不可轻忘……',
    skills: {
        ['wars.bianfuren.wanwei']: {
            name: '挽危',
            desc: '当你因被其他角色获得或弃置而失去牌时，你可以改为自己选择失去的牌；每回合限一次，当你的牌被其他角色弃置或获得后，你可以从牌堆获得一张同名的牌（无同名牌则改为摸一张牌）。',
            desc2: '①当确定你因其他角色的弃置/获得而移动的牌时，若你的能被该角色弃置/获得的牌数大于X，你可将此次移动的牌改为你的X张牌（X为此次移动的牌数）。②当你因其他角色的弃置或获得而失去手牌后❷，若于此回合内发动过此技能的次数小于1，你可获得1枚“挽”▶若你此次失去的牌数：为1且牌堆里有与此牌牌名相同的牌，你获得牌堆里的一张与此牌牌名相同的牌；为1且牌堆里没有与此牌牌名相同的牌，你摸一张牌；大于1，你摸一张牌。',
            audios: [
                {
                    url: 'generals/bianfuren/wanwei1',
                    lang: '吉凶未可知，何故自乱？',
                },
                {
                    url: 'generals/bianfuren/wanwei2',
                    lang: '虽为水火之势，亦当虑而后动。',
                },
            ],
        },
        ['wars.bianfuren.yuejian']: {
            name: '约俭',
            desc: '锁定技，一名与你势力相同角色的弃牌阶段开始时，若其本回合未使用牌指定过其他势力的角色为目标，其本回合的手牌上限等于其体力上限。',
            desc2: '锁定技，一名角色的弃牌阶段开始时，若其与你势力相同且于此回合内未对{没有势力或与你势力不同}的角色使用过牌，你令其手牌上限于此回合内为X（X为其体力上限）。',
            audios: [
                {
                    url: 'generals/bianfuren/yuejian1',
                    lang: '常闻君子以俭德辟难，不可荣以禄。',
                },
                {
                    url: 'generals/bianfuren/yuejian2',
                    lang: '如今世事未定，不可铺张浪费。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.xunyou', {
    title: '曹魏的谋主',
    rs: '荀彧',
    death_audio: '主公，臣下……先行告退……',
    skills: {
        ['wars.xunyou.qice']: {
            name: '奇策',
            desc: '出牌阶段限一次，你可以将所有手牌当任意一张普通锦囊牌使用，你不能以此法使用目标数超过X的牌（X为你的手牌数），然后你可以变更副将。',
            desc2:
                '当你于出牌阶段内需要使用使用时机为出牌阶段内的空闲时间点且额定目标数下限不大于你的手牌数的普通锦囊牌时❸，若你于此阶段内发动过此技能的次数小于1，你可使用对应的实体牌为你的所有手牌的此普通锦囊牌▶你可变更。\n' +
                '◆若你因执行〖奇策〗的消耗而使用【铁索连环】或【调虎离山】，且你的手牌数小于此牌的牌面信息中的“使用目标”产生的额定目标数上限，由此牌的牌面信息中的“使用目标”产生的额定目标数上限信息改为X（X为你的手牌数）。',
            audios: [
                {
                    url: 'generals/xunyou/qice1',
                    lang: '奇策在此，谁与争锋？',
                },
                {
                    url: 'generals/xunyou/qice2',
                    lang: '倾力为国，算无遗策。',
                },
            ],
        },
        ['wars.xunyou.zhiyu']: {
            name: '智愚',
            desc: '当你受到伤害后，你可以摸一张牌，然后展示所有手牌，若颜色均相同，伤害来源弃置一张手牌。',
            desc2: '当你受到伤害后，你可以摸一张牌▶你展示所有手牌。若你以此法展示的这些牌颜色均相同，来源弃置一张手牌。',
            audios: [
                {
                    url: 'generals/xunyou/zhiyu1',
                    lang: '大勇若怯，大智如愚。',
                },
                {
                    url: 'generals/xunyou/zhiyu2',
                    lang: '愚者既出，智者何存？',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.masu', {
    title: '帷幄经谋',
    rs: '',
    death_audio: '败军之罪，万死难赎……',
    skills: {
        ['wars.masu.sanyao']: {
            name: '散谣',
            desc: '出牌阶段限一次，你可以弃置一张牌并选择一名体力值最大（或之一）的角色，然后你对其造成1点伤害。',
            desc2: '出牌阶段限一次，你可弃置一张牌并选择一名体力值最大的角色▶你对其造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/masu/sanyao1',
                    lang: '三人成虎，事多有。',
                },
                {
                    url: 'generals/masu/sanyao2',
                    lang: '散谣惑敌，不攻自破！',
                },
            ],
        },
        ['wars.masu.zhiman']: {
            name: '制蛮',
            desc: '当你对其他角色造成伤害时，你可以防止此伤害，然后获得其装备区或判定区里的一张牌。若其与你势力相同，你可以令其选择是否变更副将。',
            desc2: '当你对其他角色造成伤害时❷，你可防止此伤害▶你获得其装备区或判定区里的一张牌。若其与你势力相同，你可令其选择：1.变更；2.获得1枚“制”。',
            audios: [
                {
                    url: 'generals/masu/zhiman1',
                    lang: '兵法谙熟于心，取胜千里之外！',
                },
                {
                    url: 'generals/masu/zhiman2',
                    lang: '丞相多虑，且看我的！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.shamoke', {
    title: '五溪蛮王',
    rs: '',
    death_audio: '年纪轻轻，竟然玩火……',
    skills: {
        ['wars.shamoke.jili']: {
            name: '蒺藜',
            desc: '当你于一回合内使用或打出第X张牌时，你可以摸X张牌。(X为你的攻击范围)',
            desc2: '当牌被使用/打出时，若使用/打出者为你且你于当前回合内使用与打出过的牌数之和为X，你可摸X张牌（X为你的攻击范围）。',
            audios: [
                {
                    url: 'generals/shamoke/jili1',
                    lang: '汉皇息怒，看我磨刀霍霍把狗屠！',
                },
                {
                    url: 'generals/shamoke/jili2',
                    lang: '抄家伙，替汉皇将他们打成野人！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lvfan', {
    title: '忠笃亮直',
    rs: '',
    death_audio: '闻主公欲授大司马之职，容臣不能……谢恩了……',
    skills: {
        ['wars.lvfan.diaodu']: {
            name: '调度',
            desc: '出牌阶段开始时，你可以获得一名与你势力相同的角色装备区里的一张牌，然后可以将此牌交给另一名角色。\n当一名与你势力相同的角色使用装备牌时，该角色可以摸一张牌。',
            desc2: '①出牌阶段开始时，你可获得与你势力相同的一名角色A的装备区里的一张牌▶你可将此牌交给除A外的一名角色。②当装备牌被使用时，若使用者与你势力相同，其可摸一张牌。',
            audios: [
                {
                    url: 'generals/lvfan/diaodu1',
                    lang: '诸军兵器战具，皆由我调配。',
                },
                {
                    url: 'generals/lvfan/diaodu2',
                    lang: '甲胄兵器，按我所说之法分发。',
                },
            ],
        },
        ['wars.lvfan.diancai']: {
            name: '典财',
            desc: '其他角色的出牌阶段结束时，若你本阶段失去过至少X张牌（X为你的体力值），你可以将手牌摸至体力上限。若如此做，你可以变更副将。',
            desc2: '其他角色的出牌阶段结束时，若你于此阶段内失去过至少X张牌（X=max{你的体力值,1}），你可将你的手牌补至Y张（Y为你的体力上限）▶你可变更。',
            audios: [
                {
                    url: 'generals/lvfan/diancai1',
                    lang: '军资之用，不可擅做主张。',
                },
                {
                    url: 'generals/lvfan/diancai2',
                    lang: '善用资财，乃为政上法。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lingtong', {
    title: '豪情烈胆',
    rs: '甘宁',
    death_audio: '大丈夫，死有何惧……',
    skills: {
        ['wars.lingtong.xuanlue']: {
            name: '旋略',
            desc: '当你失去装备区里的牌后，你可以弃置一名其他角色的一张牌。',
            desc2: '当你失去装备区里的牌后❷，你可弃置一名其他角色的一张牌。',
            audios: [
                {
                    url: 'generals/lingtong/xuanlue1',
                    lang: '轻装急袭，破敌于千里。',
                },
                {
                    url: 'generals/lingtong/xuanlue2',
                    lang: '强兵破阵，斩将于须臾。',
                },
            ],
        },
        ['wars.lingtong.yongjin']: {
            name: '勇进',
            desc: '限定技，出牌阶段，你可以依次移动场上的至多三张装备牌。',
            desc2: '限定技，出牌阶段，你可将一名角色的装备区里的一张牌置入另一名角色的装备区▶你可将一名角色的装备区里的一张牌置入另一名角色的装备区▷你可将一名角色的装备区里的一张牌置入另一名角色的装备区。',
            audios: [
                {
                    url: 'generals/lingtong/yongjin1',
                    lang: '冲啊，扬我东吴之勇！',
                },
                {
                    url: 'generals/lingtong/yongjin2',
                    lang: '东吴虎威，岂是尔等可犯。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lijueguosi', {
    title: '犯祚倾祸',
    rs: '贾诩',
    death_audio: '文和之言，诚不欺我……',
    image_self_url: 'generals/lijueguosi/image.dual.self',
    skills: {
        ['wars.lijueguosi.xiongsuan']: {
            name: '凶算',
            desc: '限定技，出牌阶段，你可以弃置一张手牌并选择一名与你势力相同的角色，对其造成1点伤害，然后你摸三张牌。\n若该角色有已发动的限定技，你选择其一个限定技，此回合结束后视为该限定技未发动过。',
            desc2: '限定技，出牌阶段，你可弃置一张手牌并选择与你势力相同的一名角色▶你对其造成1点普通伤害，摸三张牌，选择其一个发动过的次数等于发动次数上限的带有“限定技”标签的武将技能→此回合结束前❸，你将你以此法选择的技能的{于此局游戏内发动过此技能的次数}的信息改为0。',
            audios: [
                {
                    url: 'generals/lijueguosi/xiongsuan1',
                    lang: '朝中无一是男儿，谁敢拦我二人！',
                },
                {
                    url: 'generals/lijueguosi/xiongsuan2',
                    lang: '挟持天子，执掌重兵，天下可图！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zuoci', {
    title: '谜之仙人',
    rs: '于吉',
    death_audio: '腾云跨风，飞升太虚……',
    skills: {
        ['wars.zuoci.huashen']: {
            name: '化身',
            desc: '准备阶段，若你的“化身”数小于2，你可以观看武将牌堆中的随机五张牌，然后扣置其中至多两张武将牌在你的武将牌旁，称为“化身”；\n若“化身”数大于等于2，你可以用将武将牌堆里随机一张武将牌替换一张“化身”。\n你可以于相应的时机发动“化身”的一个技能，技能结算完成后将此“化身”放回剩余武将牌堆。\n你每个时机只能发动一张“化身”的技能，且不能发动带有技能类型的技能。',
            desc2:
                '①准备阶段开始时，若“化身牌”数：小于2，你可随机观看武将牌堆里的五张牌并将其中的至多两张武将牌扣置于武将牌上（均称为“化身牌”）；大于1，你可将一张“化身牌”置入武将牌堆并随机将武将牌堆里的一张牌扣置于武将牌上（称为“化身牌”）。②你能发动“化身牌”上的未带有技能标签的触发类技能。\n' +
                '◆这些技能均会增加“展示并将此‘化身牌’置入武将牌堆并令所有 ‘化身牌’上的除此技能外的未带有技能标签的触发类技能于此时机无效”的消耗。',
            audios: [
                {
                    url: 'generals/zuoci/huashen1',
                    lang: '万物苍生，幻化由心。',
                },
                {
                    url: 'generals/zuoci/huashen2',
                    lang: '哼，肉眼凡胎，岂能窥视仙人变幻？',
                },
            ],
        },
        ['wars.zuoci.xinsheng']: {
            name: '新生',
            desc: '当你受到伤害后，你可以将武将牌堆里随机一张武将牌加入到“化身”牌中。',
            desc2: '当你受到伤害后，你可随机将武将牌堆里的一张牌扣置于武将牌上（称为“化身牌”）。',
            audios: [
                {
                    url: 'generals/zuoci/xinsheng1',
                    lang: '幻幻无穷，生生不息。',
                },
                {
                    url: 'generals/zuoci/xinsheng2',
                    lang: '吐故纳新，师法天地。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.yujin', {
    title: '讨暴坚垒',
    rs: '夏侯惇',
    death_audio: '如今临危处难，却负丞相三十年之赏识，哎……',
    skills: {
        ['wars.yujin.jieyue']: {
            name: '节钺',
            desc: '准备阶段，你可以交给一名其他势力的一名角色一张手牌，然后令其执行“军令”。\n若其执行，你摸一张牌；\n若其不执行，则你本回合的摸牌阶段额外摸三张牌。',
            desc2: '准备阶段开始时，你可一张牌交给没有势力或与你势力不同或的一名角色▶其选择是否执行军令。若其选择：是，你摸一张牌；否→摸牌阶段，你令额定摸牌数+3。',
            audios: [
                {
                    url: 'generals/yujin/jieyue1',
                    lang: '按丞相之命，此部今由余统摄。',
                },
                {
                    url: 'generals/yujin/jieyue2',
                    lang: '奉法行令，事上之节，岂有宽宥之理。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.cuiyanmaojie', {
    title: '日出月盛',
    rs: '曹丕',
    death_audio: '为世所痛惜，冤哉……',
    image_self_url: 'generals/cuiyanmaojie/image.dual.self',
    skills: {
        ['wars.cuiyanmaojie.zhengbi']: {
            name: '征辟',
            desc: '出牌阶段开始时，你可以选择一名：\n1.未确定势力的其他角色，本阶段你对其使用牌无距离和次数限制直到其明置；\n2.已确定势力的其他角色，将一张基本牌交给其，令其交给你一张非基本牌或两张基本牌。',
            desc2: '出牌阶段开始时，你可选择：1.选择一名没有势力的其他角色并获得1枚“征”▶你于此回合结束前或其明置其武将牌前对其使用牌{无次数的限制且无距离关系的限制}；2.选择一名有势力的其他角色并交给其一张基本牌▶其选择：1.交给你一张非基本牌；2.交给你两张基本牌。',
            audios: [
                {
                    url: 'generals/cuiyanmaojie/zhengbi1',
                    lang: '跅弛之士，在御之而已。',
                },
                {
                    url: 'generals/cuiyanmaojie/zhengbi2',
                    lang: '内不避亲，外不避仇。',
                },
            ],
        },
        ['wars.cuiyanmaojie.fengying']: {
            name: '奉迎',
            desc: '限定技，出牌阶段，你可以将所有手牌当做【挟天子以令诸侯】无视条件使用，令所有与你势力相同的角色将手牌摸至其体力上限。',
            desc2:
                '限定技，当你需要使用【挟天子以令诸侯】时❸，你可使用对应的实体牌为你的所有手牌的【挟天子以令诸侯】▶（→）此【挟天子以令诸侯】指定第一个目标后，所有与你势力相同的角色各将其手牌补至其体力上限。\n' +
                '◆你因使用此【挟天子以令诸侯】而进行的合法性检测的规则中，由此牌的牌面信息中的“使用目标”产生的规则改为“你”。',
            audios: [
                {
                    url: 'generals/cuiyanmaojie/fengying1',
                    lang: '二臣恭奉，以迎皇嗣。',
                },
                {
                    url: 'generals/cuiyanmaojie/fengying2',
                    lang: '奉旨典选，以迎忠良。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.wangping', {
    title: '键闭剑门',
    rs: '蒋琬费祎',
    death_audio: '容王某再拜先主，此乃最后一道军令……',
    skills: {
        ['wars.wangping.jianglue']: {
            name: '将略',
            desc: '限定技，出牌阶段，你可以选择一个“军令”，与你势力相同的其他角色均可执行该军令。你和每一个执行军令的角色体力上限+1（不能大于5）且回复1点体力，然后你摸X张牌（X为执行此军令的人数+1）。',
            desc2: '限定技，出牌阶段，你可选择军令▶所有与你势力相同的其他角色各{选择是否执行此军令。若其选择是，其获得1枚“将”}。你和所有有“将”的角色各{{若体力上限不大于5，加1点体力上限}。回复1点体力▷获得一枚“略”}。你摸X张牌（X为有“略”的角色数）。所有角色各弃其所有“将”和“略”。',
            audios: [
                {
                    url: 'generals/wangping/jianglue1',
                    lang: '军令如山，宜速行之',
                },
                {
                    url: 'generals/wangping/jianglue2',
                    lang: '这是死命令！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.fazheng', {
    title: '蜀汉的辅翼',
    rs: '刘备',
    death_audio: '正虽死，也会睁眼静候汉室再兴之日……',
    skills: {
        ['wars.fazheng.enyuan']: {
            name: '恩怨',
            desc: '锁定技，当其他角色对你使用【桃】时，该角色摸一张牌；\n当你受到伤害后，伤害来源需交给你一张手牌，否则失去1点体力。',
            desc2: '①锁定技，当你成为【桃】的目标后，若使用者不为你，其摸一张牌。②锁定技，当你受到伤害后，你令来源选择：1.将一张手牌交给你；2.失去1点体力。',
            audios: [
                {
                    url: 'generals/fazheng/enyuan1',
                    lang: '我一向先小人，后君子。',
                },
                {
                    url: 'generals/fazheng/enyuan2',
                    lang: '正，又想起了我王。',
                },
                {
                    url: 'generals/fazheng/enyuan3',
                    lang: '你无义，别怪我无情。',
                },
                {
                    url: 'generals/fazheng/enyuan4',
                    lang: '血债，自当血偿！',
                },
            ],
        },
        ['wars.fazheng.xuanhuo']: {
            name: '眩惑',
            desc: '与你势力相同的其他角色的出牌阶段限一次，该角色可以交给你一张手牌并弃置一张牌，然后其选择并获得以下技能之一直到回合结束：“武圣”、“咆哮”、“龙胆”、“铁骑”、“烈弓”、“狂骨”。（场上已有的技能不能选择）',
            desc2: '与你势力相同的其他角色的出牌阶段限一次，其可将一张手牌交给你▶其弃置一张牌▷其选择下列技能中所有角色均没有的一个：〖武圣〗、〖咆哮〗、〖龙胆〗、〖铁骑〗、〖烈弓〗和〖狂骨〗。其于此回合内或明置有其以此法选择的技能的武将牌之前拥有其以此法选择的技能。',
            audios: [
                {
                    url: 'generals/fazheng/xuanhuo1',
                    lang: '将军立功我庆功，这才叫分工明确。',
                },
                {
                    url: 'generals/fazheng/xuanhuo2',
                    lang: '定军山他朝成名，因吾等今日一拼！',
                },
            ],
        },
        ['wars.fazheng.wusheng']: {
            name: '武圣',
            desc: '你可以将一张红色牌当【杀】使用或打出。',
            desc2: '当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张红色牌的普【杀】。',
            audios: [
                {
                    url: 'generals/fazheng/wusheng1',
                    lang: '关将军雄姿，由你再现。',
                },
                {
                    url: 'generals/fazheng/wusheng2',
                    lang: '再次威震华夏，必成汉兴佳话。',
                },
            ],
        },
        ['wars.fazheng.paoxiao']: {
            name: '咆哮',
            desc: '锁定技，你使用【杀】无次数限制；你在一回合内使用第二张【杀】时，摸一张牌。',
            desc2: '①锁定技，你使用【杀】无次数的限制。②锁定技，当【杀】被使用时，若使用者为你且你于此回合内使用过两张【杀】，你摸一张牌。',
            audios: [
                {
                    url: 'generals/fazheng/paoxiao1',
                    lang: '杀！把他捅成马蜂窝。',
                },
                {
                    url: 'generals/fazheng/paoxiao2',
                    lang: '昔日长坂坡，今日再咆哮！',
                },
            ],
        },
        ['wars.fazheng.longdan']: {
            name: '龙胆',
            desc: '你可以将【杀】当【闪】、【闪】当【杀】使用或打出。你发动“龙胆”时，若你的【杀】被【闪】抵消，则你可以对另一名角色造成1点伤害；若你的【闪】抵消了【杀】，则你可以令一名其他角色回复1点体力(不能是【杀】的使用者)。',
            desc2: '①当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张【闪】的普【杀】。②当你需要使用/打出【闪】时❸，你可使用/打出对应的实体牌为你的一张【杀】的【闪】。③当【杀】被一名角色使用的【闪】抵消后，若此【杀】/【闪】是你通过发动〖龙胆①〗/〖龙胆②〗来使用的，你可对另一名角色造成1点普通伤害/令另一名不为此【杀】的使用者的角色回复1点体力。',
            audios: [
                {
                    url: 'generals/fazheng/longdan1',
                    lang: '请收好，此乃子龙枪法。',
                },
                {
                    url: 'generals/fazheng/longdan2',
                    lang: '子龙将助你一臂之力。',
                },
            ],
        },
        ['wars.fazheng.tieqi']: {
            name: '铁骑',
            desc: '当你使用【杀】指定一个目标后，你可以进行判定，然后令其本回合一张明置的武将牌的非锁定技失效。除非该角色弃置与结果花色相同的一张牌，否则不能使用【闪】。',
            desc2: '当【杀】指定目标后，若使用者为你，你可判定▶你选择此目标对应的角色的一张处于明置状态的武将牌。此牌的所有未带有“锁定技”标签的武将技能于当前回合内无效。其选择：1.弃置与结果花色相同的一张牌；2.令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。',
            audios: [
                {
                    url: 'generals/fazheng/tieqi1',
                    lang: '西凉的马蹄声，真好听！',
                },
                { url: 'generals/fazheng/tieqi2', lang: '马家军风采何在？！' },
            ],
        },
        ['wars.fazheng.liegong']: {
            name: '烈弓',
            desc: '当你于出牌阶段内使用【杀】指定一个目标后，若该角色的手牌数不小于你的体力值或不大于你的攻击范围，则你可以令其不能使用【闪】响应此【杀】。',
            desc2: '当【杀】于出牌阶段内指定目标后，若此目标对应的角色的手牌数不小于你的体力值或不大于你的攻击范围，且使用者为你，你可令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。',
            audios: [
                {
                    url: 'generals/fazheng/liegong1',
                    lang: '当年老将军冲锋，也是这时机！',
                },
                {
                    url: 'generals/fazheng/liegong2',
                    lang: '百步穿杨，立功拜将！',
                },
            ],
        },
        ['wars.fazheng.kuanggu']: {
            name: '狂骨',
            desc: '当你对距离1以内的一名角色造成伤害后，你可以回复1点体力或摸一张牌。',
            desc2: '当你对一名角色造成伤害后，若你至其的距离于其因受到此伤害而扣减体力前小于2，你可选择：1.回复1点体力；2.摸一张牌。',
            audios: [
                {
                    url: 'generals/fazheng/kuanggu1',
                    lang: '看来，你跟文长不相伯仲啊。',
                },
                {
                    url: 'generals/fazheng/kuanggu2',
                    lang: '打过去，你就能超越五虎之亚。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.wuguotai', {
    title: '慈怀瑾瑜',
    rs: '孙坚',
    death_audio: '诸位卿家，还请尽力辅佐仲谋啊……',
    skills: {
        ['wars.wuguotai.ganlu']: {
            name: '甘露',
            desc: '出牌阶段限一次，你可以令装备区牌数之差不大于X的两名角色交换装备区所有牌。（X为你已损失体力值）',
            desc2: '出牌阶段限一次，你可令两名装备区里的牌数不均为0且差不大于你已损失的体力值的角色交换装备区里的牌。',
            audios: [
                {
                    url: 'generals/wuguotai/ganlu1',
                    lang: '玄德实乃佳婿呀。',
                },
                {
                    url: 'generals/wuguotai/ganlu2',
                    lang: '好一个郎才女貌，真是天作之合啊。',
                },
            ],
        },
        ['wars.wuguotai.buyi']: {
            name: '补益',
            desc: '每回合限一次，与你势力相同的角色进入濒死状态被救回后，你可令本次伤害来源执行一次“军令”。若其不执行，则该濒死的角色回复1点体力。',
            desc2: '当一名角色A因受到伤害而进行的濒死结算结束后，若A与你势力相同且存活且你于当前回合内发动过此技能的次数小于1，你可令来源B选择是否执行军令▶若B选择“否”，A回复1点体力。',
            audios: [
                {
                    url: 'generals/wuguotai/buyi1',
                    lang: '有我在，定保贤婿无虞。',
                },
                {
                    url: 'generals/wuguotai/buyi2',
                    lang: '东吴岂容汝等儿戏。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lukang', {
    title: '孤柱扶厦',
    rs: '陆逊',
    death_audio: '抗仅以君子之交待叔子，未有半分背国之念啊……',
    skills: {
        ['wars.lukang.keshou']: {
            name: '恪守',
            desc: '当你受到伤害时，你可以弃置两张颜色相同的牌，令此伤害-1。若没有与你势力相同的其他角色，你判定，若结果为红色，你摸一张牌。',
            desc2: '当你受到伤害时❷，你可弃置两张颜色相同的牌▶伤害值-1。若没有与你势力相同的其他角色，你判定▷若结果为红色，你摸一张牌。',
            audios: [
                {
                    url: 'generals/lukang/keshou1',
                    lang: '仁以待民，自处不败之势。',
                },
                {
                    url: 'generals/lukang/keshou2',
                    lang: '宽济百姓，则得战前养备之机。',
                },
            ],
        },
        ['wars.lukang.zhuwei']: {
            name: '筑围',
            desc: '当你的判定牌生效后，你可以获得之并可以令当前回合角色本回合手牌上限与出牌阶段使用【杀】的次数限制各+1。',
            desc2: '当你进行的判定结果确定后❷，你可获得此牌▶你可令当前回合角色使用【杀】的次数上限于此回合内+1且其手牌上限于此回合内+1。',
            audios: [
                {
                    url: 'generals/lukang/zhuwei1',
                    lang: '背水一战，只为破敌。',
                },
                {
                    url: 'generals/lukang/zhuwei2',
                    lang: '全线并进，连战克晋。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zhangxiu', {
    title: '北地枪王',
    rs: '贾诩',
    death_audio: '若失文和，吾将何归……',
    skills: {
        ['wars.zhangxiu.fudi']: {
            name: '附敌',
            desc: '当你受到其他角色造成的伤害后，你可以交给伤害来源一张手牌。若如此做，你对其所属势力体力值最多且不小于你的一名角色造成1点伤害。',
            desc2: '当你受到伤害后，你可将一张手牌交给来源▶你对与其势力相同的所有角色中的体力值最大且不小于你的体力值的一名角色造成一点普通伤害。',
            audios: [
                {
                    url: 'generals/zhangxiu/fudi1',
                    lang: '弃暗投明，为明公计！',
                },
                {
                    url: 'generals/zhangxiu/fudi2',
                    lang: '绣虽有降心，奈何贵营难容。',
                },
            ],
        },
        ['wars.zhangxiu.congjian']: {
            name: '从谏',
            desc: '锁定技，你于回合外造成的伤害+1；\n你于回合内受到的伤害+1。',
            desc2: '①锁定技，当你于回合外造成伤害时❶，你令伤害值+1。②锁定技，当你于回合内受到伤害时❷，你令伤害值+1。',
            audios: [
                {
                    url: 'generals/zhangxiu/congjian1',
                    lang: '从谏良计，可得自保。',
                },
                {
                    url: 'generals/zhangxiu/congjian2',
                    lang: '听君谏言，去危亡，保宗祀。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.yuanshu', {
    title: '仲家帝',
    rs: '纪灵',
    death_audio: '蜜……蜜水呢……',
    skills: {
        ['wars.yuanshu.weidi']: {
            name: '伪帝',
            desc: '出牌阶段限一次，你可以选择一名本回合从牌堆获得过牌的其他角色，令其执行一次“军令”。\n若其不执行，则获得其全部手牌，然后交给其等量的牌。',
            desc2: '出牌阶段限一次，你可令一名于此回合内得到过牌堆里的牌的其他角色选择是否执行军令▶若其选择“否”，你获得其所有手牌，将等量的牌交给该角色。',
            audios: [
                {
                    url: 'generals/yuanshu/weidi1',
                    lang: '是明是暗，你自己选好了。',
                },
                {
                    url: 'generals/yuanshu/weidi2',
                    lang: '违朕旨意，死路一条！',
                },
            ],
        },
        ['wars.yuanshu.yongsi']: {
            name: '庸肆',
            desc: '锁定技，若场上没有【玉玺】，你视为装备着【玉玺】；\n当你成为【知己知彼】的目标后，你展示所有手牌。',
            desc2: '①锁定技，若所有角色的装备区里均没有【玉玺】且你的宝物区不处于封印状态，你视为装备着【玉玺】。②锁定技，当你成为【知己知彼】的目标后，你展示所有手牌。',
            audios: [
                {
                    url: 'generals/yuanshu/yongsi1',
                    lang: '看我大淮南，兵精粮足！',
                },
                {
                    url: 'generals/yuanshu/yongsi2',
                    lang: '老子明牌，不虚你们这些渣渣！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lord_liubei', {
    title: '龙横蜀汉',
    rs: '蜀势力武将',
    death_audio: '若嗣子可辅，辅之。如其不才，君可自取……',
    skills: {
        ['wars.lord_liubei.shouyue']: {
            name: '授钺',
            desc: '君主技，你拥有“五虎将大旗”。',
            desc2: '锁定技，你拥有〖五虎将大旗〗。',
            audios: [
                {
                    url: 'generals/lord_liubei/shouyue',
                    lang: '布德而昭仁，见旗如见朕!',
                },
            ],
        },
        ['wars.lord_liubei.wuhujiangdaqi']: {
            name: '五虎将大旗',
            desc:
                '存活的蜀势力角色技能分别按以下调整：\n' +
                '武圣——将“红色牌”改为“任意牌”。\n' +
                '咆哮——增加描述“你使用【杀】无视其他角色防具。”\n' +
                '龙胆——增加描述“当你以此法使用或打出牌时，你摸一张牌。”\n' +
                '烈弓——增加描述“你的攻击范围+1。”\n' +
                '铁骑——将“一张明置武将牌的非锁定技失效”改为“所有明置武将牌的非锁定技失效”。',
            desc2:
                '①存活的蜀势力角色拥有的〖武圣〗改为{ 当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张牌的普【杀】 }。\n' +
                '②存活的蜀势力角色拥有的〖咆哮〗改为{①锁定技，你使用【杀】无次数的限制。②锁定技，当【杀】被使用时，若使用者为你且你于此回合内使用过两张【杀】，你摸一张牌。③锁定技，当【杀】指定目标后，若使用者为你，你获得1枚“咆”▶你令此目标对应的角色的防具技能于下列情况之一发生之前无效。\n' +
                '◆其防具技能无效的效果会持续至：1.对其无效的此【杀】对此目标进行的使用流程结束；2.此杀被其使用的【闪】抵消；3.防止此目标对应的角色因执行此牌的效果而造成的伤害；4.确定此目标对应的角色因执行此牌的效果而造成的伤害的最终的伤害值。}。\n' +
                '③存活的蜀势力角色拥有的〖龙胆〗改为{①当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张【闪】的普【杀】▶（→）当此【杀】被使用/打出时，你摸一张牌。②当你需要使用/打出【闪】时❸，你可使用/打出对应的实体牌为你的一张【杀】的【闪】▶（→）当此【闪】被使用/打出时，你摸一张牌。③当【杀】被一名角色使用的【闪】抵消后，若此【杀】/【闪】是你通过发动〖龙胆①〗/〖龙胆②〗来使用的，你可对另一名角色造成1点普通伤害/令另一名不为此【杀】的使用者的角色回复1点体力。}。\n' +
                '④存活的蜀势力角色拥有的〖铁骑〗改为{ 当【杀】指定目标后，若使用者为你，你可判定▶你令其所有明置的武将牌的所有未带有“锁定技”标签的武将技能于当前回合内无效。其选择：1.弃置与结果花色相同的一张牌；2.令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标 }。\n' +
                '⑤存活的蜀势力角色拥有的〖烈弓〗改为{①当【杀】于出牌阶段内指定目标后，若此目标对应的角色的手牌数不小于你的体力值或不大于你的攻击范围，且使用者为你，你可令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。②你的攻击范围+1。}。',
            audios: [],
        },
        ['wars.lord_liubei.zhangwu']: {
            name: '章武',
            desc: '锁定技，当【飞龙夺凤】进入弃牌堆或其他角色的装备区后，你获得之。\n当你失去【飞龙夺凤】前，你展示之，然后将此牌置于牌堆底并摸两张牌。',
            desc2: '①锁定技，当【飞龙夺凤】移至弃牌堆或其他角色的装备区后❷，你获得此【飞龙夺凤】。②锁定技，当你并非因使用而失去【飞龙夺凤】前❷，你展示此【飞龙夺凤】▶你将此【飞龙夺凤】的此次移动的目标区域改为牌堆底，摸两张牌。',
            audios: [
                {
                    url: 'generals/lord_liubei/zhangwu1',
                    lang: '遁剑归一，有凤来仪。',
                },
                {
                    url: 'generals/lord_liubei/zhangwu2',
                    lang: '剑气化龙，听朕雷动！',
                },
            ],
        },
        ['wars.lord_liubei.jizhao']: {
            name: '激诏',
            desc: '限定技，当你处于濒死状态时，你可以将手牌补至体力上限，然后你将体力回复至2点，失去“授钺”，获得“仁德”。',
            desc2: '限定技，当你处于濒死状态时，你可将你的手牌补至X张（X为你的体力上限）▶你将体力回复至2点，失去〖授钺〗并获得〖仁德〗。',
            audios: [
                {
                    url: 'generals/lord_liubei/jizhao1',
                    lang: '仇未报，汉未兴，朕志犹在！',
                },
                {
                    url: 'generals/lord_liubei/jizhao2',
                    lang: '王业不偏安，起师再兴汉！',
                },
            ],
        },
        ['wars.lord_liubei.rende']: {
            name: '仁德',
            desc: '出牌阶段每名角色限一次，你可以将任意张手牌交给一名其他角色，当你以此法给出第二张牌时，你可以视为使用一张基本牌。',
            desc2:
                '出牌阶段，你可将至少一张手牌交给一名角色▶你于此阶段内不能再次对这些角色发动此技能。若你于此阶段内因执行此技能的消耗而交给其他角色的手牌数大于1且于此次发动此技能之前于此阶段内因执行此技能的消耗而交给其他角色的手牌数小于2，你可使用无对应的实体牌的基本牌。\n' +
                '◆若你因执行〖仁德〗的效果而使用【杀】，你须声明是使用哪种【杀】，且你因使用此【杀】而进行的合法性检测的规则中，由此牌的牌面信息中的“使用目标”产生的规则改为“你的攻击范围内的其他角色”且此【杀】计入限制的次数。',
            audios: [
                {
                    url: 'generals/lord_liubei/rende1',
                    lang: '勿以恶小而为之，勿以善小而不为。',
                },
                {
                    url: 'generals/lord_liubei/rende2',
                    lang: '君才十倍于丕，必能安国成事。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lord_zhangjiao', {
    title: '时代的先驱',
    rs: '群势力武将',
    death_audio: '天，真要灭我……',
    skills: {
        ['wars.lord_zhangjiao.hongfa']: {
            name: '弘法',
            desc: '君主技，你拥有“黄巾天兵符”。',
            desc2: '锁定技，你拥有〖黄巾天兵符〗。',
            audios: [
                {
                    url: 'generals/lord_zhangjiao/hongfa',
                    lang: '苍天已死，黄天当立！',
                },
            ],
        },
        ['wars.lord_zhangjiao.huangjinsymbol']: {
            name: '黄巾天兵符',
            desc:
                '准备阶段开始时，若“黄巾天兵符”上没有牌，你亮出牌堆顶的X张牌并将之置于“黄巾天兵符”上，称为“天兵”。（X为存活的群势力角色数）\n' +
                '与你势力相同的角色可以将一张“天兵”当【杀】使用或打出。\n' +
                '你计算存活的群势力角色数可以至多+X。（X为你的“天兵”的数）\n' +
                '当你失去体力时，若你有“天兵”，你可以终止此次失去体力流程，然后选择一张“天兵”置入弃牌堆。',
            desc2:
                '①准备阶段开始时，若没有“天兵”，你将牌堆顶的X张牌置于武将牌上，称为“天兵”（X为群势力角色数）。\n' +
                '②与你势力相同的角色需要使用/打出普【杀】时❸，其可使用/打出对应的实体牌为一张“天兵”的普【杀】。\n' +
                '③你执行的效果中的“群势力角色数”+X（X为不大于“天兵”数的自然数）。\n' +
                '④当你的失去体力结算开始前，若有“天兵”，你可终止此失去体力流程▶你将一张“天兵”置入弃牌堆。',
            audios: [
                {
                    url: 'generals/lord_zhangjiao/huangjinsymbol1',
                    lang: '此乃天将天兵，尔等妖孽看着！',
                },
                {
                    url: 'generals/lord_zhangjiao/huangjinsymbol2',
                    lang: '且作一法，召唤神力！',
                },
                {
                    url: 'generals/lord_zhangjiao/huangjinsymbol3',
                    lang: '吾有天神护体！',
                },
            ],
        },
        ['wars.lord_zhangjiao.wuxin']: {
            name: '悟心',
            desc: '摸牌阶段开始时，你可以观看牌堆顶的X张牌，然后将这些牌以任意顺序置于牌堆顶。（X为存活的群势力角色数且至多为10）',
            desc2: '摸牌阶段开始时❷，你可观看牌堆顶的X张牌并可改变这些牌的顺序。（X为群势力角色数且至多为10）',
            audios: [
                {
                    url: 'generals/lord_zhangjiao/wuxin1',
                    lang: '冀悟迷惑之心。',
                },
                {
                    url: 'generals/lord_zhangjiao/wuxin2',
                    lang: '吾已明此救世之术矣。',
                },
            ],
        },
        ['wars.lord_zhangjiao.wendao']: {
            name: '问道',
            desc: '出牌阶段限一次，你可以弃置一张牌名不为【太平要术】的红色牌，然后你获得场上或弃牌堆中的一张【太平要术】。',
            desc2: '出牌阶段限一次，你可以弃置一张不为【太平要术】的红色牌▶你获得弃牌堆里或一名角色的装备区里的【太平要术】。',
            audios: [
                {
                    url: 'generals/lord_zhangjiao/wendao1',
                    lang: '诚心求天地之道，救世之法。',
                },
                {
                    url: 'generals/lord_zhangjiao/wendao2',
                    lang: '求太平之法以安天下。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lord_sunquan', {
    title: '虎踞江东',
    rs: '吴势力武将',
    death_audio: '朕的江山，要倒下了么……',
    skills: {
        ['wars.lord_sunquan.jiahe']: {
            name: '嘉禾',
            desc: '君主技，你拥有“缘江烽火图”。',
            desc2:
                '锁定技，你拥有〖缘江烽火图〗。\n' +
                '◆你失去〖嘉禾〗，系统须将你的武将牌旁的“烽火”置入弃牌堆。',
            audios: [
                {
                    url: 'generals/lord_sunquan/jiahe',
                    lang: '嘉禾生，大吴兴！',
                },
            ],
        },
        ['wars.lord_sunquan.flamemap']: {
            name: '缘江烽火图',
            desc:
                '每名吴势力角色的出牌阶段限一次，该角色可以将一张装备牌置于你的“缘江烽火图”上，称为“烽火”。\n' +
                '每名吴势力角色的准备阶段，该角色可以根据“烽火”的数量在“①英姿”、“②好施”、“③涉猎”、“④度势”中选择技能，然后获得所选技能直到回合结束。\n' +
                '“烽火”数为：\n1，选择技能①；\n2，在技能①②中选择一个；\n3，在技能①②③中选择一个；\n4，在技能①②③④中选择一个；\n5或以上，在技能①②③④中选择两个。\n' +
                '锁定技，当你受到【杀】或锦囊牌造成的伤害后，你将一张“烽火”置入弃牌堆。',
            desc2:
                '①一名吴势力角色的出牌阶段限一次，其可将一张装备牌置于你的武将牌旁（称为“烽火”）。\n' +
                '②一名吴势力角色的准备阶段开始时，若“烽火”数：为1，其可于此回合内拥有〖英姿〗；为2，{其可于此回合内拥有下列技能中的一个：〖英姿〗和〖好施〗}；为3，{其可于此回合内拥有下列技能中的一个：〖英姿〗、〖好施〗和〖涉猎〗}；为4，{其可于此回合内拥有下列技能中的一个：〖英姿〗、〖好施〗、〖涉猎〗和〖度势〗}；为5，{其可于此回合内拥有下列技能中的一至两个：〖英姿〗、〖好施〗、〖涉猎〗和〖度势〗}。\n' +
                '③锁定技，当你受到渠道为【杀】或锦囊牌的伤害后，你将一张“烽火”置入弃牌堆。',
            audios: [
                {
                    url: 'generals/lord_sunquan/flamemap1',
                    lang: '保卫国家，人人有责！',
                },
                {
                    url: 'generals/lord_sunquan/flamemap2',
                    lang: '连绵的烽火，就是对敌人最好的震慑！',
                },
                {
                    url: 'generals/lord_sunquan/flamemap3',
                    lang: '有敌来犯，速速御敌！',
                },
                {
                    url: 'generals/lord_sunquan/flamemap4',
                    lang: '来，扶孤上马迎敌！',
                },
            ],
        },
        ['wars.lord_sunquan.yingzi']: {
            name: '英姿',
            desc: '锁定技，摸牌阶段，你多摸一张牌；你的手牌上限等于你的体力上限。',
            desc2: '①锁定技，摸牌阶段，你令额定摸牌数+1。②锁定技，你的手牌上限为X（X为你的体力上限）。',
            audios: [
                {
                    url: 'generals/lord_sunquan/yingzi1',
                    lang: '大吴江山，儒将辈出。',
                },
                {
                    url: 'generals/lord_sunquan/yingzi2',
                    lang: '千夫奉儒将，百兽伏麒麟。',
                },
            ],
        },
        ['wars.lord_sunquan.haoshi']: {
            name: '好施',
            desc: '摸牌阶段，你可以多摸两张牌，然后摸牌阶段结束时，若你的手牌数大于5，你将一半的手牌（向下取整）交给一名手牌最少的其他角色。',
            desc2: '摸牌阶段，你可令额定摸牌数+1▶（→）摸牌阶段结束时，若你的手牌数大于5，你将一半的手牌交给除你外手牌数最小的一名角色。',
            audios: [
                {
                    url: 'generals/lord_sunquan/haoshi1',
                    lang: '朋友有难，当倾囊相助。',
                },
                {
                    url: 'generals/lord_sunquan/haoshi2',
                    lang: '好东西，就要跟朋友分享。',
                },
            ],
        },
        ['wars.lord_sunquan.shelie']: {
            name: '涉猎',
            desc: '摸牌阶段，你可以改为亮出牌堆顶的五张牌，然后获得其中每种花色的牌各一张。',
            desc2: '摸牌阶段开始时❷，你可令额定摸牌数改为0▶你亮出牌堆顶的五张牌，获得其中每种花色的牌各一张。',
            audios: [
                {
                    url: 'generals/lord_sunquan/shelie1',
                    lang: '军中多务，亦当涉猎。',
                },
                {
                    url: 'generals/lord_sunquan/shelie2',
                    lang: '少说话，多看书。',
                },
            ],
        },
        ['wars.lord_sunquan.duoshi']: {
            name: '度势',
            desc: '出牌阶段限四次，你可以将一张红色手牌当【以逸待劳】使用。',
            desc2: '当你需要使用【以逸待劳】时❸，若你于当前阶段内发动过此技能的次数小于4，你可使用对应的实体牌为你的一张红色手牌的【以逸待劳】。',
            audios: [
                {
                    url: 'generals/lord_sunquan/duoshi1',
                    lang: '广施方略，以观其变。',
                },
                {
                    url: 'generals/lord_sunquan/duoshi2',
                    lang: '莫慌，观察好局势再做行动。',
                },
            ],
        },
        ['wars.lord_sunquan.lianzi']: {
            name: '敛资',
            desc: '出牌阶段限一次，你可以弃置一张手牌，然后亮出牌堆顶X张牌，你获得其中所有与你弃置牌类别相同的牌，将其余的牌置入弃牌堆。若你获得的牌数大于3，你失去“敛资”，获得“制衡”。（X为所有吴势力角色装备区里的牌数和“烽火”的之和）',
            desc2: '出牌阶段限一次，你可弃置一张手牌▶你亮出牌堆顶的X张牌（X为所有吴势力角色装备区里的牌数与“烽火”数之和），获得你以此法亮出的这些牌中的所有与你以此法弃置的牌类别相同的牌。若你以此法得到的牌数大于3，你失去〖敛资〗，获得〖制衡〗。',
            audios: [
                {
                    url: 'generals/lord_sunquan/lianzi1',
                    lang: '税以足食，赋以足兵。',
                },
                {
                    url: 'generals/lord_sunquan/lianzi2',
                    lang: '府库充盈，国家方能强盛！',
                },
            ],
        },
        ['wars.lord_sunquan.jubao']: {
            name: '聚宝',
            desc: '锁定技，其他角色不能获得你装备区里的宝物牌。\n结束阶段，若弃牌堆或场上有【定澜夜明珠】，你摸一张牌，然后获得装备区里有【定澜夜明珠】的角色的一张牌。',
            desc2: '①锁定技，其他角色不能获得你的装备区里的宝物牌。②锁定技，结束阶段开始时，若有装备区里有【定澜夜明珠】的角色或弃牌堆里有【定澜夜明珠】，你摸一张牌▶你获得其一张牌。',
            audios: [
                {
                    url: 'generals/lord_sunquan/jubao1',
                    lang: '四海之宝，孤之所爱。',
                },
                {
                    url: 'generals/lord_sunquan/jubao2',
                    lang: '夷州、扶南、辽东，皆大吴臣邦也！',
                },
            ],
        },
        ['wars.lord_sunquan.zhiheng']: {
            name: '制衡',
            desc: '出牌阶段限一次，你可以弃置至多X张牌（X为你的体力上限），然后摸等量的牌。',
            desc2: '出牌阶段限一次，你可弃置至多X张牌（X为你的体力上限）▶你摸等量的牌。',
            audios: [
                {
                    url: 'generals/lord_sunquan/zhiheng1',
                    lang: '二宫并阕，孤之所愿。',
                },
                {
                    url: 'generals/lord_sunquan/zhiheng2',
                    lang: '鲁王才兼文武，堪比太子。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lord_caocao', {
    title: '凤舞九霄',
    rs: '魏势力武将',
    death_audio: '神龟虽寿，犹有竟时。腾蛇乘雾，终为土灰。',
    skills: {
        ['wars.lord_caocao.jianan']: {
            name: '建安',
            desc: '君主技，你拥有“五子良将纛”。',
            desc2: '锁定技，你拥有〖五子良将纛〗。',
            audios: [
                {
                    url: 'generals/lord_caocao/jianan',
                    lang: '设使天下无孤，不知当几人称帝，几人称王',
                },
            ],
        },
        ['wars.lord_caocao.elitegeneralflag']: {
            name: '五子良将纛',
            desc: '每名魏势力角色的准备阶段，该角色可以弃置一张牌，若其武将牌全部处于明置状态，则选择其一张非君主武将牌暗置，然后选择其一张暗置的武将牌并在“突袭”、“骁果”、“节钺”、“巧变”、“断粮”中选择一个全场明置的武将牌中没有的技能，直到你的下回合开始，其获得所选技能且不能明置以此法选择的暗置武将牌。',
            desc2: '魏势力角色的准备阶段开始时，其可弃置一张牌▶若其：两张武将牌均处于明置状态，{其暗置一张不为君主武将牌的武将牌，选择下列技能中所有角色处于明置状态的武将牌上均没有的一个：〖突袭〗、〖骁果〗、〖巧变〗、〖节钺〗和〖断粮〗。其于你的下个回合开始之前拥有其以此法选择的技能且不能明置此武将牌}；仅有一张武将牌处于暗置状态，{其选择下列技能中所有角色处于明置状态的武将牌上均没有的一个：〖突袭〗、〖骁果〗、〖巧变〗、〖节钺〗和〖断粮〗。其于你的下个回合开始之前拥有其以此法选择的技能且不能明置此武将牌}。',
            audios: [
                {
                    url: 'generals/lord_caocao/elitegeneralflag1',
                    lang: '行为军锋，还为后拒！',
                },
                {
                    url: 'generals/lord_caocao/elitegeneralflag2',
                    lang: '国之良将，五子为先！',
                },
            ],
        },
        ['wars.lord_caocao.huibian']: {
            name: '挥鞭',
            desc: '出牌阶段限一次，你可以选择一名已受伤的魏势力角色和另一名魏势力角色，你对后者造成1点伤害，然后令其摸两张牌，令已受伤的前者回复1点体力。',
            desc2: '出牌阶段限一次，你可选择一名魏势力角色和另一名已受伤的魏势力角色并对前者造成1点普通伤害▶前者摸两张牌，后者回复1点体力。',
            audios: [
                {
                    url: 'generals/lord_caocao/huibian1',
                    lang: '吾任天下之智力，以道御之，无所不可。',
                },
                {
                    url: 'generals/lord_caocao/huibian2',
                    lang: '青青子衿，悠悠我心。但为君故，沉吟至今。',
                },
            ],
        },
        ['wars.lord_caocao.zongyu']: {
            name: '总御',
            desc: '当【六龙骖驾】进入其他角色装备区后，若你装备区里有坐骑牌，你可以与其交换装备区里所有的坐骑牌；\n当你使用一张坐骑牌时，若弃牌堆或场上有【六龙骖驾】，你可以将此次使用的坐骑牌置入弃牌堆，然后将【六龙骖驾】置入你的装备区。',
            desc2: '①当【六龙骖驾】移至其他角色的装备区后❷，若你的装备区里有坐骑牌，你可交换你与其装备区里的所有坐骑牌。②当坐骑牌被使用时，若使用者为你且{一名角色的装备区或弃牌堆里有【六龙骖驾】}，你可将被使用的此坐骑牌对应的所有实体牌置入弃牌堆▶你将【六龙骖驾】置入你的装备区。',
            audios: [
                {
                    url: 'generals/lord_caocao/zongyu1',
                    lang: '驾六龙，乘风而行。行四海，路下之八邦。',
                },
                {
                    url: 'generals/lord_caocao/zongyu2',
                    lang: '齐桓之功，为霸之首。九合诸侯，一匡天下。',
                },
            ],
        },
        ['wars.lord_caocao.tuxi']: {
            name: '突袭',
            desc: '摸牌阶段，你可以少摸任意张牌，然后获得等量名其他角色的各一张手牌。',
            desc2: '摸牌阶段，你可令额定摸牌数-X并选择等量的有手牌的其他角色（X∈[1,你发动此技能前的额定摸牌数终值]）▶你获得这些角色的各一张手牌。',
            audios: [
                {
                    url: 'generals/lord_caocao/tuxi1',
                    lang: '以百破万，让孤再看一次！',
                },
                {
                    url: 'generals/lord_caocao/tuxi2',
                    lang: '望将军身影，可去孤之头风病。',
                },
            ],
        },
        ['wars.lord_caocao.xiaoguo']: {
            name: '骁果',
            desc: '其他角色的结束阶段，你可以弃置一张基本牌，然后除非该角色弃置一张装备牌且你摸一张牌，否则受到你造成的1点伤害。',
            desc2: '其他角色的结束阶段开始时，若其存活，你可弃置一张基本牌▶其选择：1.弃置一张装备牌▷；2.受到你造成的1点普通伤害。',
            audios: [
                {
                    url: 'generals/lord_caocao/xiaoguo1',
                    lang: '使孤梦回辽东者，卿之雄风也！',
                },
                {
                    url: 'generals/lord_caocao/xiaoguo2',
                    lang: '得贤人共治天下，得将军共定天下！',
                },
            ],
        },
        ['wars.lord_caocao.jieyue']: {
            name: '节钺',
            desc: '准备阶段开始时，你可以交给一名其他势力的一名角色一张手牌，然后令其执行“军令”。若其执行，你摸一张牌；若其不执行，则你本回合的摸牌阶段额外摸三张牌。',
            desc2: '准备阶段开始时，你可一张牌交给没有势力或与你势力不同或的一名角色▶其选择是否执行军令。若其选择：是，你摸一张牌；否→摸牌阶段，你令额定摸牌数+3。',
            audios: [
                {
                    url: 'generals/lord_caocao/jieyue1',
                    lang: '孤之股肱，谁敢不从？嗯？',
                },
                {
                    url: 'generals/lord_caocao/jieyue2',
                    lang: '泰山之高，群山不可及；文则之重，泰山不可及。',
                },
            ],
        },
        ['wars.lord_caocao.qiaobian']: {
            name: '巧变',
            desc: '你可以弃置一张手牌并跳过一个阶段：若跳过摸牌阶段，你可以获得至多两名角色的各一张手牌；若跳过出牌阶段，你可以移动场上的一张牌。',
            desc2: '①判定阶段开始前或弃牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段。②摸牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段，可选择至多两名有手牌的其他角色，获得这些角色的各一张手牌。③出牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段，可将一名角色的判定/装备区里的一张牌置入另一名角色的判定/装备区。',
            audios: [
                {
                    url: 'generals/lord_caocao/qiaobian1',
                    lang: '孤之兵道，此一时，彼一时。',
                },
                {
                    url: 'generals/lord_caocao/qiaobian2',
                    lang: '时变，势变，孤唯才是举。',
                },
            ],
        },
        ['wars.lord_caocao.duanliang']: {
            name: '断粮',
            desc: '出牌阶段，你可以将一张黑色基本牌或黑色装备牌当一张【兵粮寸断】使用；你使用【兵粮寸断】无距离限制；若你对距离超过2的角色使用【兵粮寸断】，则本回合不能在发动“断粮“。',
            desc2: '①当你需要使用【兵粮寸断】时❸，你可使用对应的实体牌为你的一张不为锦囊牌的黑色牌的【兵粮寸断】▶若你至曾是此牌的目标对应的角色的的角色距离大于2，你于此回合内不能发动此技能。②你使用【兵粮寸断】无距离关系的限制。',
            audios: [
                {
                    url: 'generals/lord_caocao/duanliang1',
                    lang: '孤以为断粮如断肠，卿意下如何？',
                },
                {
                    url: 'generals/lord_caocao/duanliang2',
                    lang: '卿名为“亚夫”，实为“冠军”也。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.lord_simayi', {
    title: '时代的归墟',
    rs: '晋势力武将',
    death_audio: '洛水滔滔，难诉吾一生坎坷……',
    image_url: 'generals/lord_simayi/image',
    skills: {
        ['wars.lord_simayi.jiaping']: {
            name: '嘉平',
            desc: '君主技，你拥有“八荒死士令”。',
            desc2: '锁定技，你拥有〖八荒死士令〗。',
            audios: [
                {
                    url: 'generals/lord_simayi/jiaping',
                    lang: '藏锋四十载，终昭吾亮剑之时！',
                },
            ],
        },
        ['wars.lord_simayi.bahuangsishiling']: {
            name: '八荒死士令',
            desc: '每轮限一次，每名晋势力角色的出牌阶段，若其于此轮内明置过武将牌，其可移除副将的武将牌，然后从“瞬覆”、“奉迎”、“将略”、“勇进”、“乱武”中选择并发动一个未以此法选择过的技能。',
            desc2:
                '①一名晋势力角色的出牌阶段，若其于此轮内明置过武将牌且〖八荒死士令〗于此轮内被发动过的次数小于1且此技能于此局游戏内被发动过的次数小于1，其可移除其副将的武将牌并选择至多三名没有势力的角色▶这些角色各{摸两张牌，可使用【杀】（无距离关系的限制）}。\n' +
                '◆一名角色因执行〖八荒死士令①〗的效果而使用的【杀】不是牌的合法目标。\n' +
                '②一名晋势力角色的出牌阶段，若其于此轮内明置过武将牌且〖八荒死士令〗于此轮内被发动过的次数小于1且此技能于此局游戏内被发动过的次数小于1，其可移除其副将的武将牌并选择所有除其外的角色▶这些角色各需对包括距离最小的另一名角色在内的角色使用【杀】，否则失去1点体力。\n' +
                '③一名晋势力角色A的出牌阶段，若A于此轮内明置过武将牌且〖八荒死士令〗于此轮内被发动过的次数小于1且此技能于此局游戏内被发动过的次数小于1，A可移除其副将的武将牌▶A选择军令▷{限定技，出牌阶段，你可选择军令▶所有与你势力相同的其他角色各{选择是否执行此军令。若其选择是，其获得1枚“将”}。你和所有有“将”的角色各{{若体力上限不大于5，加1点体力上限}。回复1点体力▷获得一枚“略”}。你摸X张牌（X为有“略”的角色数）。所有角色各弃其所有“将”和“略”。}\n' +
                '④一名晋势力角色的出牌阶段，若其于此轮内明置过武将牌且〖八荒死士令〗于此轮内被发动过的次数小于1且此技能于此局游戏内被发动过的次数小于1且有角色的装备区里有{能置入另一名角色的装备区里}的装备牌，其可移除其副将的武将牌▶其将一名角色的装备区里的一张牌置入另一名角色的装备区▷其可将一名角色的装备区里的一张牌置入另一名角色的装备区▷其可将一名角色的装备区里的一张牌置入另一名角色的装备区。\n' +
                '⑤当一名晋势力角色需要使用【挟天子以令诸侯】时❸，若其于此轮内明置过武将牌且〖八荒死士令〗于此轮内被发动过的次数小于1且此技能于此局游戏内被发动过的次数小于1且其有副将，其可使用对应的实体牌为其所有手牌的【挟天子以令诸侯】▶其移除其副将的武将牌。系统继续进行此牌的使用流程→此【挟天子以令诸侯】指定第一个目标后，所有与其势力相同的角色各将手牌补至X张（X为各自的体力上限）。\n' +
                '◆一名角色因使用此【挟天子以令诸侯】而进行的合法性检测的规则中，由此牌的牌面信息中的“使用目标”产生的规则改为“你”。',
            audios: [],
        },
        ['wars.lord_simayi.guikuang']: {
            name: '诡诳',
            desc: '出牌阶段限一次，你可以令两名角色拼点（不能为两名势力相同的角色），拼点牌为红色的角色依次对拼点没赢的角色造成1点伤害。',
            desc2: '出牌阶段限一次，你可选择{不为势力相同的角色}的两名角色并令这两名角色拼点▶所有拼点牌为红色的角色各对所有未赢的角色造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/lord_simayi/guikuang1',
                    lang: '数载春去秋来，静看大江东流。',
                },
                {
                    url: 'generals/lord_simayi/guikuang2',
                    lang: '吞吴克蜀，老臣毕生之志也。',
                },
            ],
        },
        ['wars.lord_simayi.shujuan']: {
            name: '舒卷',
            desc: '锁定技，【戢鳞潜翼】每回合首次被置入弃牌堆或其他角色的装备区后，你获得并使用之。',
            desc2: '锁定技，当【戢鳞潜翼】移至弃牌堆或一名其他角色的装备区后❷，若于此次移动事件开始之前没有与此牌牌名相同的牌于当前回合内移至{弃牌堆或一名角色的装备区}过，你获得此牌▶你使用对应的实体牌为此牌的装备牌。',
            audios: [
                {
                    url: 'generals/lord_simayi/shujuan1',
                    lang: '戢鳞潜翼，蓄志待时。',
                },
                {
                    url: 'generals/lord_simayi/shujuan2',
                    lang: '坐观潮起潮落，笑谈云卷云舒。',
                },
            ],
        },
        ['wars.lord_simayi.shunfu']: {
            name: '瞬覆',
            desc: '限定技，出牌阶段，你可令至多三名未确定势力的其他角色各摸两张牌，然后这些角色依次选择是否使用一张无距离限制且不可响应的【杀】。',
            desc2:
                '限定技，出牌阶段，你可选择至多三名没有势力的其他角色并获得1枚“覆”▶这些角色各{摸两张牌，可使用【杀】（无距离关系的限制）}。\n' +
                '◆一名角色因执行〖瞬覆〗的效果而使用的【杀】不是牌的合法目标',
            audios: [
                {
                    url: 'generals/lord_simayi/shunfu',
                    lang: '天地造化，不过老夫一念之间！',
                },
            ],
        },
        ['wars.lord_simayi.fengying']: {
            name: '奉迎',
            desc: '限定技，出牌阶段，你可以将所有手牌当做【挟天子以令诸侯】无视条件使用，令所有与你势力相同的角色将手牌摸至其体力上限。',
            desc2:
                '限定技，当你需要使用【挟天子以令诸侯】时❸，你可使用对应的实体牌为你的所有手牌的【挟天子以令诸侯】▶（→）此【挟天子以令诸侯】指定第一个目标后，所有与你势力相同的角色各将其手牌补至其体力上限。\n' +
                '◆你因使用此【挟天子以令诸侯】而进行的合法性检测的规则中，由此牌的牌面信息中的“使用目标”产生的规则改为“你”。',
            audios: [
                {
                    url: 'generals/lord_simayi/fengying',
                    lang: '臣当总领西事，不负陛下所托。',
                },
            ],
        },
        ['wars.lord_simayi.jianglue']: {
            name: '将略',
            desc: '限定技，出牌阶段，你可以选择一个“军令”，与你势力相同的其他角色均可执行该军令。你和每一个执行军令的角色体力上限+1（不能大于5）且回复1点体力，然后你摸X张牌（X为执行此军令的人数+1）。',
            desc2: '限定技，出牌阶段，你可选择军令▶所有与你势力相同的其他角色各{选择是否执行此军令。若其选择是，其获得1枚“略”}。你和所有有“略”的角色各加1点体力上限，回复1点体力。你摸X张牌（X为因执行发动此次〖将略〗的效果而回复体力的角色数）。所有角色弃其所有“略”。',
            audios: [
                {
                    url: 'generals/lord_simayi/jianglue',
                    lang: '能战当战，不能战，当死耳！',
                },
            ],
        },
        ['wars.lord_simayi.yongjin']: {
            name: '勇进',
            desc: '限定技，出牌阶段，你可以依次移动场上的至多三张装备牌。',
            desc2: '限定技，出牌阶段，你可将一名角色的装备区里的一张牌置入另一名角色的装备区▶你可将一名角色的装备区里的一张牌置入另一名角色的装备区▷你可将一名角色的装备区里的一张牌置入另一名角色的装备区。',
            audios: [
                {
                    url: 'generals/lord_simayi/yongjin',
                    lang: '连下诸城以筑京观，足永平辽东之患！',
                },
            ],
        },
        ['wars.lord_simayi.luanwu']: {
            name: '乱武',
            desc: '限定技，出牌阶段，你可以令所有其他角色依次选择一项：1.对距离最近的另一名角色使用一张【杀】；2.失去1点体力。',
            desc2: '限定技，出牌阶段，你可获得1枚“乱武”并选择所有其他角色。这些角色各需对包括距离最小的另一名角色在内的角色使用【杀】，否则失去1点体力。',
            audios: [
                {
                    url: 'generals/lord_simayi/luanwu',
                    lang: '连诛其族，翦其党羽，以夷后患！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.duyu', {
    title: '文成武德',
    rs: '羊祜',
    death_audio: '金瓯尚缺，死难瞑目……',
    image_url: 'generals/duyu/image',
    skills: {
        ['wars.duyu.sanchen']: {
            name: '三陈',
            desc: '出牌阶段对每名角色限一次，若你的武将牌均明置，你可令一名角色摸三张牌然后弃置三张牌。若因此弃置了类别相同的牌，你暗置此武将牌。',
            desc2: '出牌阶段，若你的武将牌均处于明置状态，你可选择一名你本回合未因执行此技能的消耗而选择过的角色并令其摸三张牌▶其弃置三张牌。若其因执行发动此次〖三陈〗的效果而弃置过至少两张类别相同的牌，你暗置此武将牌。',
            audios: [
                {
                    url: 'generals/duyu/sanchen1',
                    lang: '陈书弼国，当一而再再而三。',
                },
                {
                    url: 'generals/duyu/sanchen2',
                    lang: '勘除弼事，三陈而就。',
                },
            ],
        },
        ['wars.duyu.pozhu']: {
            name: '破竹',
            desc: '主将技，你计算体力上限时减少1个单独的阴阳鱼。\n准备阶段，你可以将一张牌当【杀】使用，结算后你展示唯一目标一张手牌，若两张牌花色不同，你可以重复此流程。',
            desc2:
                '①主将技，奥秘技，当你选择体力牌时，此武将牌上的单独阴阳鱼个数-1。②主将技，准备阶段开始时，你可使用对应的实体牌为你的一张牌的普【杀】▶若此【杀】的目标数为1，你展示此【杀】的目标对应的角色的一张手牌。若你以此法展示的牌与此【杀】的花色不同，你可重复此流程。\n' +
                '◆此流程即“你可使用对应的实体牌为你的一张牌的普【杀】。若此【杀】的目标数为1，你展示此【杀】的目标对应的角色的一张手牌。若你以此法展示的牌与此【杀】的花色不同，你可重复此流程”。',
            audios: [
                {
                    url: 'generals/duyu/pozhu1',
                    lang: '攻其不备，摧枯拉朽。',
                },
                {
                    url: 'generals/duyu/pozhu2',
                    lang: '势如破竹，铁索横江亦难挡。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.yanghu', {
    title: '执德清劭',
    rs: '杜预',
    death_audio: '当断不断，反受其乱。',
    image_url: 'generals/yanghu/image',
    skills: {
        ['wars.yanghu.huaiyuan']: {
            name: '怀远',
            desc: '与你势力相同角色的准备阶段，你可以选择一项令其获得直到回合结束：\n1.攻击范围+1；\n2.手牌上限+1；\n3.【杀】的使用次数上限+1。',
            desc2: '与你势力相同角色的准备阶段开始时，你可选择：1.获得1枚“远”▶其攻击范围于此回合内+1；2.获得1枚“远”▶其手牌上限于此回合内+1；3.获得1枚“远”▶其使用【杀】的次数上限于此回合内+1。',
            audios: [
                {
                    url: 'generals/yanghu/huaiyuan1',
                    lang: '当怀远志，砥砺奋进。',
                },
                {
                    url: 'generals/yanghu/huaiyuan2',
                    lang: '举有成资，谋有全策。',
                },
            ],
        },
        ['wars.yanghu.fushou']: {
            name: '付授',
            desc: '锁定技，与你势力相同的角色无视主副将条件拥有其所有主将技和副将技(不重新计算阴阳鱼)。',
            desc2: '锁定技，与你势力相同的角色的武将牌上的技能的“主将技”与“副将技”标签的定义均改为“技能的标签之一”。',
            audios: [],
        },
    },
});

sgs.GeneralSetting('wars.wangxiang', {
    title: '沂川跃鲤',
    death_audio: '夫生之有死，自然之理也。',
    image_url: 'generals/wangxiang/image',
    skills: {
        ['wars.wangxiang.bingxin']: {
            name: '冰心',
            desc: '每回合每种牌名限一次，当你需要使用一张基本牌时，若你的手牌颜色均相同且数量等于你的体力值，你可以展示所有手牌(无牌则跳过)，然后摸一张牌并视为使用此基本牌。',
            desc2:
                '当你需要使用本回合未以此法使用过的基本牌时❷，若你的手牌数等于你的体力值且{你的所有手牌颜色均相同或你没有手牌}，你可获得1枚“冰心”▶你展示所有手牌。摸一张牌▷你使用无对应实体牌的此牌。\n' +
                '◆若你需要使用的是【杀】，你执行消耗的同时须声明是使用哪种【杀】',
            audios: [
                {
                    url: 'generals/wangxiang/bingxin1',
                    lang: '思鸟黄雀至，卧冰鱼自跃。',
                },
                {
                    url: 'generals/wangxiang/bingxin2',
                    lang: '夜静向寒月，卧冰求鲤鱼。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.wenyang', {
    title: '陆拔山岳',
    death_audio: '半生功业，而见疑于一家之言，岂能无怨！',
    image_url: 'generals/wenyang/image',
    skills: {
        ['wars.wenyang.duanqiu']: {
            name: '断虬',
            desc: '准备阶段，你可以视为对一个确定势力的所有其他角色使用一张【决斗】，结算后所有角色本回合仅能再使用共计X张手牌(X为结算过程共计打出【杀】的数量)。',
            desc2:
                '准备阶段开始时，你可使用无对应的实体牌的【决斗】▶于此【决斗】使用流程结束之后此回合结束之前，若被使用过的{对应的实体牌包含手牌}的牌数不小于X，所有角色不能使用对应的实体牌包含手牌的牌（X为因执行此【决斗】的效果而被打出过的【杀】数）。\n' +
                '◆你因执行〖断虬〗的消耗而使用【决斗】，此【决斗】的牌面信息中的“使用目标”改为“一个势力的所有其他角色”',
            audios: [
                {
                    url: 'generals/wenyang/duanqiu1',
                    lang: '率军冲锋，不惧刀枪所阻！',
                },
                {
                    url: 'generals/wenyang/duanqiu2',
                    lang: '登峰履刃，何妨马革裹尸。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zhanghuyuechen', {
    title: '不辱门庭',
    rs: '',
    death_audio: '儿有辱，父亲威名……',
    image_url: 'generals/zhanghuyuechen/image.dual.self',
    skills: {
        ['wars.zhanghuyuechen.xijue']: {
            name: '袭爵',
            desc: '你可以于对应时机弃置一张牌以发动“突袭”或“骁果”。',
            desc2: '你拥有〖突袭(袭爵)〗和〖骁果(袭爵)〗',
            audios: [],
        },
        ['wars.zhanghuyuechen.lvxian']: {
            name: '履险',
            desc: '主将技，当你每回合首次受到伤害后，你可以摸上回合(不能为你的回合)你失去数量的牌。',
            desc2: '主将技，当你受到伤害后，若你于受到此伤害之前于当前回合内未受到过伤害且上个回合的回合角色不为你，你可摸X张牌（X为你于上个回合内失去的牌数）。',
            audios: [
                {
                    url: 'generals/zhanghuyuechen/lvxian',
                    lang: '承爵于父，安能辱之？',
                },
            ],
        },
        ['wars.zhanghuyuechen.yingwei']: {
            name: '盈威',
            desc: '副将技，结束阶段，若你本回合内摸牌数与你造成伤害数相同，你可以重铸至多两张牌。',
            desc2: '副将技，结束阶段开始时，若你于此回合内因摸牌而得到的牌数等于你于此回合内造成过的伤害值，你可重铸至多两张牌。',
            audios: [
                {
                    url: 'generals/zhanghuyuechen/yingwei',
                    lang: '虎父安有犬子乎！',
                },
            ],
        },
        ['wars.zhanghuyuechen.tuxi']: {
            name: '突袭',
            desc: '摸牌阶段，你可以少摸任意张牌并弃置一张牌，然后获得等量名其他角色的各一张手牌。',
            desc2: '摸牌阶段，你可弃置一张牌并选择X名有手牌的其他角色（X∈{x|1≤x≤你发动此技能前的额定摸牌数终值}）▶你令额定摸牌数-X，获得这些角色的各一张手牌。',
            audios: [
                {
                    url: 'generals/zhanghuyuechen/tuxi1',
                    lang: '动如霹雳，威震枭首！',
                },
                {
                    url: 'generals/zhanghuyuechen/tuxi2',
                    lang: '行略如风，摧枯拉朽！',
                },
            ],
        },
        ['wars.zhanghuyuechen.xiaoguo']: {
            name: '骁果',
            desc: '其他角色的结束阶段，你可以弃置两张牌（至少一张是基本牌），然后除非该角色弃置一张装备牌且你摸一张牌，否则受到你造成的1点伤害。',
            desc2: '其他角色的结束阶段开始时，若其存活且你能弃置的基本牌数：{为1，你可弃置一张不为基本牌的牌；大于1，你可弃置一张牌}▶你弃置一张基本牌。其选择：1.弃置一张装备牌▷；2.受到你造成的1点普通伤害。',
            audios: [
                {
                    url: 'generals/zhanghuyuechen/xiaoguo1',
                    lang: '骁勇善战，刚毅果断！',
                },
                {
                    url: 'generals/zhanghuyuechen/xiaoguo2',
                    lang: '大丈夫生于世，当沙场效忠！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.baifuren', {
    title: '玲珑心窍',
    rs: '司马懿',
    death_audio: '世人皆惧司马，独我痴情仲达……',
    image_url: 'generals/baifuren/image',
    skills: {
        ['wars.baifuren.limeng']: {
            name: '离梦',
            desc: '结束阶段，你可以弃置一张非基本牌并选择场上两张珠联璧合的武将牌，若不为同一名角色的武将，则这两名角色依次对对方造成1点伤害。',
            desc2: '结束阶段开始时，你可弃置一张不为基本牌的牌并选择一名角色A与有{与A的一张武将牌存在珠联璧合关系}的武将牌的一名角色▶若你以此法选择了两名不同的角色，这两名角色各对你以此法选择的角色中的另一名角色造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/baifuren/limeng1',
                    lang: '福兮祸所依，祸兮福所伏。',
                },
                {
                    url: 'generals/baifuren/limeng2',
                    lang: '枯桑知风，沧海知寒。',
                },
            ],
        },
        ['wars.baifuren.xiace']: {
            name: '黠策',
            desc: '若当前回合角色有【杀】的剩余使用次数，你可以将一张牌当【无懈可击】使用，并令剩余次数-1，然后你可以变更副将。',
            desc2: '当你需要使用普【无懈可击】时❸，若此时：{不在当前回合角色的额外的出牌阶段内且其此回合的额定的出牌阶段未被跳过且其于此回合的额定的出牌阶段的空闲时间点内使用过【杀】的次数小于其于此回合的额定的出牌阶段内使用【杀】的次数上限，你可使用对应的实体牌为你的一张牌的普【无懈可击】▶其于此回合的额定的出牌阶段内使用【杀】的次数上限-1；在当前回合角色的额外的出牌阶段内且其于此阶段的空闲时间点内使用过【杀】的次数小于其于此阶段内使用【杀】的次数上限，你可使用对应的实体牌为你的一张牌的普【无懈可击】▶其使用【杀】的次数上限于此阶段内-1}。你可变更。',
            audios: [
                {
                    url: 'generals/baifuren/xiace1',
                    lang: '风之积非厚，其负大翼也无力。',
                },
                {
                    url: 'generals/baifuren/xiace2',
                    lang: '人情同于抔土，岂穷达而异心。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.yangjun', {
    title: '祸心专辅',
    rs: '',
    death_audio: '唉，终是难逃灭门之祸。',
    image_url: 'generals/yangjun/image',
    skills: {
        ['wars.yangjun.neiji']: {
            name: '内忌',
            desc: '出牌阶段开始时，你可以与一名其他势力角色同时展示两张手牌，然后弃置展示的【杀】，若合计弃置的数量大于1，你与其各摸三张牌；\n否则未弃置的角色视为对弃置的使用一张【决斗】。',
            desc2: '出牌阶段开始时，你可获得一枚“忌”并选择一名其他势力的角色▶你与其同时展示两张手牌。各弃置以此法展示的【杀】。若因此技能的效果而弃置的牌数：不小于2，你与其各摸三张牌；不大于1，你与其之中未因此技能的效果而弃置【杀】的角色对另一名角色使用无对应实体牌的【决斗】。',
            audios: [
                {
                    url: 'generals/yangjun/neiji1',
                    lang: '你我势不两立，必要争个高下，来吧！',
                },
                {
                    url: 'generals/yangjun/neiji2',
                    lang: '必要争个你死我活，方为痛快！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.sunxiu_jin', {
    title: '青纸为诏',
    rs: '司马伦',
    death_audio: '这就是所谓的报应吗？',
    image_url: 'generals/sunxiu_jin/image',
    skills: {
        ['wars.sunxiu_jin.xiejian']: {
            name: '挟奸',
            desc: '出牌阶段限一次，你可以向一名其他角色发起一次“军令”（你抽取两张军令并选择一张，另一张对目标不可见）；\n若其不执行，其须执行未被你选择的军令。',
            desc2: '出牌阶段限一次，你可令一名其他角色选择是否执行军令▶若其选择否，其执行于你此次选择军令时系统随机选择的两项操作中未被你选择作为军令的一项。',
            audios: [
                {
                    url: 'generals/sunxiu_jin/xiejian1',
                    lang: '任你如何告饶，也难免有如此一伤。',
                },
                {
                    url: 'generals/sunxiu_jin/xiejian2',
                    lang: '闭目等死，是你能做的最后一件事。',
                },
            ],
        },
        ['wars.sunxiu_jin.yinsha']: {
            name: '引杀',
            desc: '你可以将所有手牌当【借刀杀人】使用，目标须使用【杀】（若没有则将所有手牌当【杀】使用）。',
            desc2:
                '当你需要使用【借刀杀人】时❸，你可使用对应的实体牌为你的所有手牌的【借刀杀人】。\n' +
                '◆此【借刀杀人】的作用效果改为“目标对应的角色An须对包括Bn在内的角色使用【杀】。若其未因执行此牌的效果而使用【杀】，其对包括Bn在内的角色使用对应的实体牌为其所有手牌的普【杀】。若其未因执行此牌的效果而使用【杀】，其将装备区里的武器牌交给你”。',
            audios: [
                {
                    url: 'generals/sunxiu_jin/yinsha1',
                    lang: '我的计策，绝不留下一丝希望。',
                },
                {
                    url: 'generals/sunxiu_jin/yinsha2',
                    lang: '现在后悔，已经太晚啦！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.wei.yanghu', {
    title: '制纮同轨',
    image_url: 'generals/yanghu/yanghu_wei/image',
    rs: '杜预',
    death_audio: '臣死之后，杜元凯可继之。',
    skills: {
        ['wars.wei.yanghu.deshao']: {
            name: '德劭',
            desc: '每回合限X次（X为你的体力值），其他角色使用黑色牌指定你为唯一目标后，若其明置的武将牌数小于等于你，你可弃置其一张牌。',
            desc2: '当黑色牌指定目标后，若使用者不为你且其处于明置状态的武将牌数不大于你且此目标对应的角色为你且此牌的目标对应的角色数为1且你于此回合内发动此技能的次数小于你的体力值，你可弃置其一张牌。',
            audios: [
                {
                    url: 'generals/yanghu/yanghu_wei/deshao1',
                    lang: '名德远播，朝野俱瞻。',
                },
                {
                    url: 'generals/yanghu/yanghu_wei/deshao2',
                    lang: '增修德信，以诚服人。',
                },
            ],
        },
        ['wars.wei.yanghu.mingfa']: {
            name: '明伐',
            desc: '出牌阶段限一次，你可以选择其他势力的一名角色；该角色的下个回合结束时，\n若其手牌数小于你，你对其造成1点伤害并获得其一张手牌。\n若其手牌数不小于你，你摸至与其手牌数相同（至多摸至五张）。',
            desc2: '出牌阶段限一次，你可选择一名其他势力角色▶其下个回合结束前，若其手牌数：小于你，你对其造成1点普通伤害，获得其一张手牌；大于你，你摸X张牌（X=min{你与其手牌数之差,5}）。',
            audios: [
                {
                    url: 'generals/yanghu/yanghu_wei/mingfa1',
                    lang: '煌煌大事，无须诈取。',
                },
                {
                    url: 'generals/yanghu/yanghu_wei/mingfa2',
                    lang: '开示公道，不为掩袭。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.huaxin', {
    title: '渊清玉洁',
    rs: '',
    death_audio: '大举发兵，劳民伤国。',
    image_url: 'generals/huaxin/image',
    skills: {
        ['wars.huaxin.wanggui']: {
            name: '望归',
            desc: '每回合限一次，当你造成或受到伤害后，若你：\n仅明置此武将牌，你可对与你势力不同的一名角色造成1点伤害；\n武将牌均明置，你可令与你势力相同的角色各摸一张牌。',
            desc2: '当你造成或受到伤害后，若你于当前回合内未发动过此技能且此武将牌处于明置状态且你的另一张武将牌：处于明置状态，你可令与你势力相同的角色各摸一张牌；处于暗置状态，你可对与你势力不同的一名角色造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/huaxin/wanggui1',
                    lang: '存志太虚，安心玄妙。',
                },
                {
                    url: 'generals/huaxin/wanggui2',
                    lang: '礼法有度，良德才略。',
                },
            ],
        },
        ['wars.huaxin.xibing']: {
            name: '息兵',
            desc: '当一名其他角色于其出牌阶段内使用第一张的黑色【杀】或黑色普通锦囊牌指定唯一角色为目标后，你可令该角色将手牌摸至当前体力值（至多摸至五张），其以此法摸牌后本回合不能再使用手牌。\n若你与其均明置所有武将牌，你可暗置你与其各一张武将牌且本回合不能再明置此武将牌。',
            desc2: '当黑色【杀】或黑色普通锦囊牌于其他角色的出牌阶段内指定目标后，若使用者为该角色且其于此回合内于使用此牌之前未使用过黑色【杀】或黑色普通锦囊牌且目标对应的角色数为1，你可发动此技能▶{若其手牌数小于体力值，其将手牌补至X张（X为其体力值且至多为5），其于此回合内不能使用对应的实体牌均是其手牌区的牌的牌}。若你与其所有武将牌均处于明置状态，你可暗置你的一张不为君主武将牌且不为士兵牌的武将牌▷其暗置你选择的其一张不为君主武将牌且不为士兵牌的武将牌，你与其于此回合内不能明置以此法暗置的武将牌。',
            audios: [
                {
                    url: 'generals/huaxin/xibing1',
                    lang: '千里运粮，非用兵之利。',
                },
                {
                    url: 'generals/huaxin/xibing2',
                    lang: '宜弘一代之治，绍三王之迹。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zongyu', {
    title: '九酝鸿胪',
    rs: '',
    death_audio: '吾年逾七十，为少一死耳……',
    skills: {
        ['wars.zongyu.qiao']: {
            name: '气傲',
            desc: '每回合限两次，当你成为其他势力角色使用牌的目标后，你可弃置该角色的一张牌，然后你弃置一张牌。',
            desc2: '当你成为牌的目标后，若使用者为其他势力角色且你于当前回合内发动此技能的次数＜2，你可弃置其一张牌▶你弃置一张牌。',
            audios: [
                {
                    url: 'generals/zongyu/qiao1',
                    lang: '吾六十何为不受兵邪？',
                },
                {
                    url: 'generals/zongyu/qiao2',
                    lang: '芝性骄傲，吾独不为屈。',
                },
            ],
        },
        ['wars.zongyu.chengshang']: {
            name: '承赏',
            desc: '出牌阶段限一次，当你使用的指定其他势力为目标的牌结算结束后，\n若此牌没有造成伤害，你可以获得牌堆中与此牌花色点数相同的牌。\n若你没有因此获得牌，此技能视为未发动过。',
            desc2: '当对应的实体牌数为1的牌于你的出牌阶段内结算完成后，若使用者为你且此牌的目标列表中有对应的角色为其他势力角色的目标且此牌未造成过伤害，你可发动此技能▶你获得牌堆中所有与此牌花色和点数均相同的牌▷此技能于此阶段内无效。',
            audios: [
                {
                    url: 'generals/zongyu/chengshang1',
                    lang: '嘉其抗直，甚爱待之。',
                },
                {
                    url: 'generals/zongyu/chengshang2',
                    lang: '为国居功，必受封禅。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.dengzhi', {
    title: '绝境的外交家',
    rs: '',
    death_audio: '伯约啊，我帮不了你了……',
    skills: {
        ['wars.dengzhi.jianliang']: {
            name: '简亮',
            desc: '摸牌阶段开始时，若你的手牌数为全场最少，你可令与你势力相同的角色各摸一张牌。',
            desc2: '摸牌阶段开始时，若你是手牌数最小的角色，你可令与你势力相同的角色各摸一张牌。',
            audios: [
                {
                    url: 'generals/dengzhi/jianliang1',
                    lang: '岂曰少衣食，与君共袍泽。',
                },
                {
                    url: 'generals/dengzhi/jianliang2',
                    lang: '义士同心力，粮秣应期来。',
                },
            ],
        },
        ['wars.dengzhi.weimeng']: {
            name: '危盟',
            desc: '出牌阶段限一次，你可以获得一名其他角色的至多X张手牌，然后交给其等量的牌（X为你的体力值）。\n纵横：将X改为1。',
            desc2: '出牌阶段限一次，你可选择一名有手牌的其他角色▶你获得其至多X张手牌（X为你的体力值），将等量的牌交给其。你可令其于其下个回合结束之前拥有〖危盟（纵横）〗。',
            audios: [
                {
                    url: 'generals/dengzhi/weimeng1',
                    lang: '此礼献于友邦，共赴兴汉大业。',
                },
                {
                    url: 'generals/dengzhi/weimeng2',
                    lang: '吴有三江之首，何故委身仕魏？',
                },
            ],
        },
        ['wars.dengzhi.weimengzongheng']: {
            name: '危盟',
            desc: '出牌阶段限一次，你可以获得一名其他角色的一张手牌，然后交给其一张牌。',
            desc2: '出牌阶段限一次，你可选择一名有手牌的其他角色▶你获得其一张手牌，将一张牌交给其。',
        },
    },
});

sgs.GeneralSetting('wars.fengxi', {
    title: '东吴苏武',
    rs: '',
    death_audio: '乡音未改双鬓苍，身陷北国有义求。',
    skills: {
        ['wars.fengxi.yusui']: {
            name: '玉碎',
            desc: '每回合限一次，当你成为其他角色使用黑色牌的目标后，若其与你势力不同，你可以失去1点体力，然后选择一项：\n1.令其弃置X张手牌（X为其体力上限）；\n2.令其失去体力值至与你相同。',
            desc2: '当你成为黑色牌的目标后，若使用者与你势力不同且你于当前回合内未发动过此技能，你可失去1点体力▶你选择：1.令其弃置X张手牌（X为其体力上限）；2.令其失去Y点体力（Y=max{其体力值-你的体力值,0}）。',
            audios: [
                {
                    url: 'generals/fengxi/yusui1',
                    lang: '宁为玉碎，不为瓦全！',
                },
                {
                    url: 'generals/fengxi/yusui2',
                    lang: '生义相左，舍生取义。',
                },
            ],
        },
        ['wars.fengxi.boyan']: {
            name: '驳言',
            desc: '出牌阶段限一次，你可以令选择一名其他角色，该角色将手牌摸至体力上限，然后其本回合不能使用或打出手牌。\n纵横：删除“将手牌摸至体力上限”的效果。',
            desc2: '出牌阶段限一次，你可选择一名其他角色▶其将手牌补至X张（X为其体力上限），其于此回合内不能使用或打出对应的实体牌均为其手牌区里的牌的牌。你可令其于其下个回合结束之前拥有〖驳言（纵横）〗。',
            audios: [
                {
                    url: 'generals/fengxi/boyan1',
                    lang: '黑白颠倒，汝言谬矣！',
                },
                {
                    url: 'generals/fengxi/boyan2',
                    lang: '魏王高论，实为无知之言。',
                },
            ],
        },
        ['wars.fengxi.boyanzongheng']: {
            name: '驳言',
            desc: '出牌阶段限一次，你可以令选择一名其他角色，该角色本回合不能使用或打出手牌。',
            desc2: '出牌阶段限一次，你可选择一名其他角色▶其于此回合内不能使用或打出对应的实体牌均为其手牌区里的牌的牌。',
        },
    },
});

sgs.GeneralSetting('wars.luyusheng', {
    title: '义姑',
    rs: '',
    death_audio: '父亲，郁生甚是想念。',
    skills: {
        ['wars.luyusheng.zhente']: {
            name: '贞特',
            desc: '每回合限一次，当你成为其他角色使用黑色基本牌或黑色普通锦囊牌的目标后，你可令使用者选择一项：\n1.此回合不能再使用黑色牌；\n2.此牌对你无效。',
            desc2: '当你成为黑色基本牌或黑色普通锦囊牌的目标后，若使用者不为你且你于当前回合内未发动过此技能，你可令其选择：1.其于此回合内不能使用黑色的牌；2.此牌对此目标无效。',
            audios: [
                {
                    url: 'generals/luyusheng/zhente1',
                    lang: '抗声昭节，义形于色。',
                },
                {
                    url: 'generals/luyusheng/zhente2',
                    lang: '少履贞特之行，三从四德。',
                },
            ],
        },
        ['wars.luyusheng.zhiwei']: {
            name: '至微',
            desc: '当你明置此武将牌时，你可以选择一名其他角色。\n当其造成伤害后，你摸一张牌。当其受到伤害后，系统随机弃置你一张手牌。\n其获得你于弃牌阶段内弃置的牌。\n当其死亡时，若你的所有武将牌均明置，你暗置此武将牌。',
            desc2: '当你明置此武将牌后，你可令一名其他角色获得1枚“微”▶（→）当其造成伤害后，你摸一张牌；当其受到伤害后，你随机弃置一张手牌；弃牌阶段结束时，你将弃牌堆里的所有曾是你于此阶段中弃置过的你手牌的牌交给其；当其死亡时，若你明置的武将牌数为2，你暗置此武将牌。',
            audios: [
                {
                    url: 'generals/luyusheng/zhiwei1',
                    lang: '体信贯于神明，送终以礼。',
                },
                {
                    url: 'generals/luyusheng/zhiwei2',
                    lang: '昭德以行，生不能侍奉二主。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.miheng', {
    title: '狂傲奇人',
    rs: '孔融',
    death_audio: '恶口……终至杀身……',
    skills: {
        ['wars.miheng.kuangcai']: {
            name: '狂才',
            desc: '锁定技，你的回合内，你使用的牌无距离和次数限制。\n弃牌阶段开始时，若你本回合使用过牌且没造成伤害，你手牌上限-1。\n若你本回合未使用过牌，你的手牌上限+1。',
            desc2: '锁定技，①你于回合内使用牌无距离关系的限制且无次数限制。②弃牌阶段开始时，若你于此回合内：使用过牌且未造成过伤害，你的手牌上限-1；未使用过牌，你的手牌上限+1。',
            audios: [
                {
                    url: 'generals/miheng/kuangcai1',
                    lang: '耳所瞥闻，不忘于心。',
                },
                {
                    url: 'generals/miheng/kuangcai2',
                    lang: '吾焉能从屠沽儿耶！',
                },
            ],
        },
        ['wars.miheng.shejian']: {
            name: '舌剑',
            desc: '当你成为其他角色使用牌的唯一目标后，你可以弃置所有手牌。\n若如此做，你选择一项：\n1.弃置该角色等量的牌；\n2.对其造成1点伤害。',
            desc2: '当你成为牌的目标后，若使用者不为你且目标对应的角色数为1且所有角色的体力值均大于0且你有手牌，你可发动此技能▶你弃置所有手牌，你选择：1.弃置使用者X张牌（X=min{你以此法弃置的牌数, 其能被你弃置的牌数}）；2.对使用者造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/miheng/shejian1',
                    lang: '伤人的，可不止刀剑。',
                },
                {
                    url: 'generals/miheng/shejian2',
                    lang: '死公！云等道？',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.xunchen', {
    title: '三公谋主',
    rs: '',
    death_audio: '为臣当不贰，贰臣不当为。',
    skills: {
        ['wars.xunchen.fenglue']: {
            name: '锋略',
            desc: '出牌阶段限一次，你可以和一名其他角色拼点:\n若你赢，该角色交给你其区域内的两张牌；\n若你输，你交给其一张牌。\n纵横：交换“一张牌”和“两张牌”的效果。',
            desc2: '出牌阶段限一次，你可与一名角色拼点▶{若：你赢，其将区域里两张牌交给你；其赢，你将一张牌交给其}。你可令其于其下个回合结束之前拥有〖锋略（纵横）〗。',
            audios: [
                {
                    url: 'generals/xunchen/fenglue1',
                    lang: '当今敢称贤者，唯袁氏本初一人！',
                },
                {
                    url: 'generals/xunchen/fenglue2',
                    lang: '冀州宝地，本当贤者居之。',
                },
            ],
        },
        ['wars.xunchen.anyong']: {
            name: '暗涌',
            desc: '每回合限一次，当一名与你势力相同的角色对另一名其他角色造成伤害时，你可以令伤害值翻倍。\n然后若其：\n仅明置一张武将，你弃置两张手牌；\n所有武将牌均处于明置状态，你失去1点体力并失去此技能。',
            desc2: '当与你势力相同的角色A对另一名其他角色B造成伤害时，若你于当前回合内未发动过此技能，你可令伤害值+X（X为伤害值）▶若B：所有武将牌均处于明置状态，你失去1点体力，失去此技能；仅有一张武将牌处于明置状态，你弃置两张手牌。',
            audios: [
                {
                    url: 'generals/xunchen/anyong1',
                    lang: '殿上太守且相看，殿下几人还拥韩？',
                },
                {
                    url: 'generals/xunchen/anyong2',
                    lang: '冀州暗潮汹涌，群仕居危思变。',
                },
            ],
        },
        ['wars.xunchen.fengluezongheng']: {
            name: '锋略',
            desc: '出牌阶段限一次，你可以和一名其他角色拼点。\n若你赢，该角色交给你其区域内的一张牌；\n若你输，你交给其两张牌。',
        },
    },
});

sgs.GeneralSetting('wars.jiananfeng', {
    title: '凤啸峻峕',
    rs: '',
    death_audio: '只恨未早下杀手，致有今日险境……',
    skills: {
        ['wars.jiananfeng.shanzheng']: {
            name: '擅政',
            desc: '出牌阶段限一次，你可以与至多X名角色同时展示一张手牌（X为你的体力上限）。若其中：\n红色牌较多，你对未以此法展示过牌的一名角色造成1点伤害；\n黑色牌较多：你获得以此法展示的所有黑色牌。',
            desc2: '暂无',
            audios: [
                {
                    url: 'generals/jiananfeng/shanzheng1',
                    lang: '陛下于此道不明，本后且代为理政。',
                },
                {
                    url: 'generals/jiananfeng/shanzheng2',
                    lang: '诏命皆从我出，诸君当知谁为这一国之主。',
                },
                {
                    url: 'generals/jiananfeng/shanzheng3',
                    lang: '尔等罪证，可俱在本宫手中。',
                },
                {
                    url: 'generals/jiananfeng/shanzheng4',
                    lang: '哼！再有犯者，皆犹如此人。',
                },
            ],
        },
        ['wars.jiananfeng.liedu']: {
            name: '烈妒',
            desc: '锁定技，其他女性角色和手牌数大于你的角色不能响应你使用的牌。',
            desc2: '锁定技，当牌指定第一个目标后，若使用者为你，你令是此牌目标对应的其他女性角色和手牌数大于你的角色不能响应此牌',
            audios: [
                {
                    url: 'generals/jiananfeng/liedu1',
                    lang: '好个贱婢，看来留不得你。',
                },
                {
                    url: 'generals/jiananfeng/liedu2',
                    lang: '待本后开腔破肚，一验是子是女。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.xiahouhui', {
    title: '深渊的白莲',
    rs: '',
    death_audio: '夫君，你怎么对我如此狠心……',
    skills: {
        ['wars.xiahouhui.yishi']: {
            name: '宜室',
            desc: '每回合限一次，当一名其他角色于其出牌阶段内弃置手牌后，你可以令其获得其中的一张牌，然后你获得其余的牌。',
            desc2: '当一名其他角色因弃置而失去手牌后❷，若此时为其出牌阶段内且你于当前回合内发动过此技能的次数小于1，你可将弃牌堆里的这些牌中的一张交给该角色▶你获得弃牌堆里的这些牌中的其余的牌。',
            audios: [
                {
                    url: 'generals/xiahouhui/yishi1',
                    lang: '家庭和顺，夫妻和睦。',
                },
                {
                    url: 'generals/xiahouhui/yishi2',
                    lang: '之子于归，宜其室家。',
                },
            ],
        },
        ['wars.xiahouhui.shidu']: {
            name: '识度',
            desc: '出牌阶段限一次，你可以与一名角色拼点：若你赢，你获得其所有手牌，然后你交给其一半手牌（向下取整）。',
            desc2: '出牌阶段限一次，你可与一名其他角色拼点▶若你赢，你获得其所有手牌▷你将一半的手牌交给其。',
            audios: [
                {
                    url: 'generals/xiahouhui/shidu1',
                    lang: '鉴识得体，气度雅涵。',
                },
                {
                    url: 'generals/xiahouhui/shidu2',
                    lang: '宽容体谅，宽人益己。',
                },
            ],
        },
    },
});

export {};
