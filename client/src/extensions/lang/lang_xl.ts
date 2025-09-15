sgs.GeneralSetting('xl.simayan', {
    title: '晋武帝',
    rs: '张华 裴秀',
    death_audio: '汝南王何在……',
    image_url: 'generals/xl/xl.simayan/image',
    death_url: 'generals/xl/xl.simayan/death',
    skills: {
        ['xl.simayan.kangning']: {
            name: '康宁',
            desc: '锁定技，与你势力相同的角色的手牌上限+1。',
            desc2: '锁定技，与你势力相同的角色手牌上限+1。',
            audios: [],
        },
        ['xl.simayan.porang']: {
            name: '迫让',
            desc: '准备阶段，你可以弃置一张牌，令一名手牌最多的其他角色选择一项：\n1. 移存两张牌；\n2. 受到你造成的1点伤害。',
            desc2: '①准备阶段开始时，你可弃置一张牌并选择一名手牌数最多的其他角色▶其选择：\n1.将两张牌置入后备区；\n2.你对其造成1点普通伤害。\n②锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.simayan/porang1',
                    lang: '天命在晋，陛下可愿效法汉献旧事？',
                },
                {
                    url: 'generals/xl/xl.simayan/porang2',
                    lang: '这江山印玺，汝可承之重乎？',
                },
            ],
        },
        ['xl.simayan.fenfeng']: {
            name: '分封',
            desc: '限定技，出牌阶段，你可以交给每名与你势力相同的角色至多三张后备区的牌。',
            desc2: '限定技，出牌阶段，你可选择所有（明置后会）与你势力相同的角色▶你各交给这些角色至多三张后备区里的牌。',
            audios: [
                {
                    url: 'generals/xl/xl.simayan/fenfeng1',
                    lang: '昔曹魏锢宗而亡其望，吾欲更之。',
                },
                {
                    url: 'generals/xl/xl.simayan/fenfeng2',
                    lang: '司马氏荣辱与共，必可匡弼晋室。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.simazhao', {
    title: '四海威服',
    rs: '王元姬 司马师',
    death_audio: '这最后一步，就交给安世了……',
    image_url: 'generals/xl/xl.simazhao/image',
    death_url: 'generals/xl/xl.simazhao/death',

    skills: {
        ['xl.simazhao.daidi']: {
            name: '怠敌',
            desc: '每轮限一次，其他角色的出牌阶段开始时，你可以与其拼点，若你赢，其选择一项：\n1. 其本回合造成的伤害-1；\n2. 其失去1点体力。若你没赢，此技能视为未发动过。',
            desc2: '其他角色的出牌阶段开始时，你可与其拼点▶若你赢，此技能于此轮内失效▷其选择：1.获得一枚“傲”→{当其与此回合内造成伤害时❷，其令此伤害-1。}；2.失去1点体力。',
            audios: [
                {
                    url: 'generals/xl/xl.simazhao/daidi1',
                    lang: '虚张声势，尔等安能辨之。',
                },
                {
                    url: 'generals/xl/xl.simazhao/daidi2',
                    lang: '汝是进是退，皆在吾掌握之中。',
                },
            ],
        },
        ['xl.simazhao.zhaoxin']: {
            name: '昭心',
            desc: '限定技，当你处于濒死状态时，你可以将体力回复至体力上限，手牌补至三张，然后获得技能“逆节”。',
            desc2: '限定技，当你处于濒死状态时，你可发动此技能▶将体力回复至体力上限。手牌补至三张。获得〖逆节〗。',
            audios: [
                {
                    url: 'generals/xl/xl.simazhao/zhaoxin1',
                    lang: '若不早图，彼必害我！',
                },
                {
                    url: 'generals/xl/xl.simazhao/zhaoxin2',
                    lang: '大魏之江山？实为我大晋之基业！',
                },
            ],
        },
        ['xl.simazhao.nijie']: {
            name: '逆节',
            desc: '锁定技，你的手牌始终对所有角色可见；你于每名角色的回合内首次造成或受到的伤害+1。',
            desc2: '①锁定技，你的手牌对所有角色可见。\n②锁定技，当你造成伤害时❷，若你于此回合内未发动过此技能，你令此伤害+1。\n③锁定技，当你受到伤害时❷，若你于此回合内未发动过此技能，你令此伤害+1。',
            audios: [
                {
                    url: 'generals/xl/xl.simazhao/nijie1',
                    lang: '天下谤我，何妨血流成河。',
                },
                {
                    url: 'generals/xl/xl.simazhao/nijie2',
                    lang: '吾心昭于天，行昭于世，岂是尔等可撼！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wangyuanji', {
    title: '闱芳廷正',
    rs: '司马昭',
    death_audio: '桃符性急，汝为兄不慈，恐不能相容……',
    image_url: 'generals/xl/xl.wangyuanji/image',
    death_url: 'generals/xl/xl.wangyuanji/death',

    skills: {
        ['xl.wangyuanji.qianchong']: {
            name: '谦冲',
            desc: '当一名与你势力相同的角色受到伤害时，若此伤害来源与你势力相同，你可以防止此伤害。\n与你势力相同的角色可以于其出牌阶段内对与你势力相同的已受伤的角色使用【桃】。',
            desc2: '①当一名与你势力相同的角色受到伤害时❷，若来源与其势力相同，你可防止此伤害。\n②与你势力相同的角色于其的出牌阶段使用【桃】（使用方法①）的使用目标改为“一名已受伤且与你势力相同的角色”。',
            audios: [
                {
                    url: 'generals/xl/xl.wangyuanji/qianchong1',
                    lang: '君不记文帝陈王之事乎。',
                },
                {
                    url: 'generals/xl/xl.wangyuanji/qianchong2',
                    lang: '诸公皆同族兄弟，宜友善互助。',
                },
            ],
        },
        ['xl.wangyuanji.zhijian']: {
            name: '织俭',
            desc: '一名与你势力相同的角色弃牌阶段结束时，你可以移存一半（向上取整）其于此阶段中弃置的牌。\n当一名与你势力相同的角色于其回合外失去最后的手牌时，你可以交给其一张后备区里的牌。',
            desc2: '①一名与你势力相同的角色的弃牌阶段结束时，你可将弃牌堆里曾是其此阶段因弃置而移至弃牌堆的牌的一半（向上取整）置入后备区。\n②当至少一名角色于他们的回合外失去手牌后❷，你可交给其中与你势力相同且没有手牌的角色一张后备区里的牌。\n③锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.wangyuanji/zhijian1',
                    lang: '奢费财力之事，吾不齿也。',
                },
                {
                    url: 'generals/xl/xl.wangyuanji/zhijian2',
                    lang: '遭逢乱世，更知生机之可贵。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wenyang', {
    title: '披靡震霄',
    rs: '',
    death_audio: '司马繇，你竟敢公报私仇！',
    image_url: 'generals/xl/xl.wenyang/image',
    death_url: 'generals/xl/xl.wenyang/death',

    skills: {
        ['xl.wenyang.danxiong']: {
            name: '胆雄',
            desc: '出牌阶段，若你于本阶段使用的上一张牌为非转化的实体牌，你可以将一张与此牌颜色不同的手牌当【决斗】使用。',
            desc2: '当你于出牌阶段内需要使用【决斗】时❸，若你于此阶段内使用过牌且你于此阶段内使用的上一张牌为非转化牌且此牌对应的实体牌的数量为1，你可使用对应的实体牌为你的一张与此牌颜色不同的手牌的【决斗】。',
            audios: [
                {
                    url: 'generals/xl/xl.wenyang/danxiong1',
                    lang: '效天人之威，一骑荡千军。',
                },
                {
                    url: 'generals/xl/xl.wenyang/danxiong2',
                    lang: '七进七出，令汝魂断胆散！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.simafu', {
    title: '魏之贞士',
    rs: '',
    death_audio: '不伊不周，不夷不惠，立身行道，终始若一。',
    image_url: 'generals/xl/xl.simafu/image',
    death_url: 'generals/xl/xl.simafu/death',

    skills: {
        ['xl.simafu.xunde']: {
            name: '勋德',
            desc: '当你受到伤害后，你可以观看牌堆顶的X张牌，获得其中一张牌，然后将其余的牌以任意顺序置于牌堆顶或牌堆底（X为你当前已损失的体力值+1）。',
            desc2: '当你受到伤害后，你可将牌堆顶的X张牌（X为你的已损失的体力值+1）扣置入处理区（对你可见）▶你获得其中一张。将其余的牌中的任意数量的牌置于牌堆顶。将处理区里是你因此技能消耗而置入此区域的牌置于牌堆底。',
            audios: [
                {
                    url: 'generals/xl/xl.simafu/xunde1',
                    lang: '司马门乃洛阳重地，放心交给我。',
                },
                {
                    url: 'generals/xl/xl.simafu/xunde2',
                    lang: '吴军急功近利，当以缓制之。',
                },
            ],
        },
        ['xl.simafu.chenjie']: {
            name: '臣节',
            desc: '锁定技，当一名魏势力角色杀死你时，或当你杀死一名魏势力角色时，你视为魏势力角色执行奖惩（不影响游戏结束）。',
            desc2: '锁定技，你/魏势力角色杀死魏势力角色/你而执行奖惩时，你视为魏势力角色。',
            audios: [
                {
                    url: 'generals/xl/xl.simafu/chenjie1',
                    lang: '臣纵姓司马，固魏之纯臣。',
                },
                {
                    url: 'generals/xl/xl.simafu/chenjie2',
                    lang: '陛下见弑，皆臣之罪也。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.simawang', {
    title: '盛銮赞国',
    rs: '',
    death_audio: '',
    image_url: 'generals/xl/xl.simawang/image',
    death_url: 'generals/xl/xl.simawang/death',
    skills: {
        ['xl.simawang.weisu']: {
            name: '威肃',
            desc: '当一名与你势力相同的角色的牌于其回合外因弃置或被其他角色获得而即将失去时，你可以失去1点体力，防止之。',
            desc2: '当一名与你势力相同的角色于其回合外因弃置或被除其外的角色获得而失去牌前❷，你可失去1点体力▶你防止这些牌中其因弃置或被除其外的角色获得而失去的牌的移动。',
            audios: [
                {
                    url: 'generals/xl/xl.simawang/weisu1',
                    lang: '有我在此镇守，雍凉无忧。',
                },
                {
                    url: 'generals/xl/xl.simawang/weisu2',
                    lang: '吾等严防死守，必叫蜀军无功而返。',
                },
            ],
        },
        ['xl.simawang.linlian']: {
            name: '吝敛',
            desc: '锁定技，当你死亡时，你移存所有牌。',
            desc2: '①锁定技，当你死亡时，你将所有牌置入后备区。②锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.simawang/linlian1',
                    lang: '司马家即国家，故吾家财亦可为国帑也。',
                },
                {
                    url: 'generals/xl/xl.simawang/linlian2',
                    lang: '钱，乃身中之物！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.zhanghua', {
    title: '近次夫子',
    rs: '司马炎',
    death_audio: '广武涧前叹……竖子……难与谋……',
    image_url: 'generals/xl/xl.zhanghua/image',
    death_url: 'generals/xl/xl.zhanghua/death',

    skills: {
        ['xl.zhanghua.xiuzhuan']: {
            name: '修撰',
            desc: '出牌阶段每项限一次，\n1.你可以移存一张与后备区里的牌花色均不同的牌；\n2.你可以将一张后备区里的牌交给一名角色。',
            desc2: '①出牌阶段限一次，你可将一张与后备区里的牌的花色均不相同的一张牌置入后备区。\n（注：后备区概念中背面朝上的牌没有花色点数信息，描述里不用写，但代码需要判）\n②出牌阶段限一次，你可将一张后备区里的牌交给一名角色。\n③锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.zhanghua/xiuzhuan1',
                    lang: '削繁就简，当为后世立范。',
                },
                {
                    url: 'generals/xl/xl.zhanghua/xiuzhuan2',
                    lang: '此篇悖于礼制，当删之。',
                },
            ],
        },
        ['xl.zhanghua.bowu']: {
            name: '博物',
            desc: '弃牌阶段开始时，你可以摸X张牌，然后你可以使用一张装备牌或与后备区里的牌名相同的牌（X为后备区里的牌的类别数）。',
            desc2: '①弃牌阶段开始时，你可摸X张牌（X为后备区里的牌的类别数）▶你选择：1.使用一张对应的所有实体牌均为手牌的装备牌；2.使用一张对应的所有实体牌均为手牌且后备区里的牌有与此牌牌名相同且与此牌牌名相同的牌。\n②锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.zhanghua/bowu1',
                    lang: '胸藏万卷，何惧疑难！',
                },
                {
                    url: 'generals/xl/xl.zhanghua/bowu2',
                    lang: '《山经》《水注》，皆在吾彀中！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.peixiu', {
    title: '方寸万里',
    rs: '司马炎',
    death_audio: '这酒，怎么是冷的……',
    image_url: 'generals/xl/xl.peixiu/image',
    death_url: 'generals/xl/xl.peixiu/death',

    skills: {
        ['xl.peixiu.zuoming']: {
            name: '佐命',
            desc: '当一名角色的判定牌生效前，你可以打出一张后备区里的牌代替之。',
            desc2: '①当判定结果确定前，你可打出对应的实体牌是后备区里的一张牌且与此牌牌名相同的牌▶系统将此牌作为判定牌，将原判定牌置入弃牌堆。\n②锁定技，后备区的牌对你可见。\n◆你发动〖佐命①〗开始的打出流程结束之前，不会插入默认的系统将此判定牌置入弃牌堆的移动事件。',
            audios: [
                {
                    url: 'generals/xl/xl.peixiu/zuoming1',
                    lang: '中抚军茂望威仪，难久为人臣。',
                },
                {
                    url: 'generals/xl/xl.peixiu/zuoming2',
                    lang: '异纹既显真龙兆，吾一言以佐之！',
                },
            ],
        },
        ['xl.peixiu.liuti']: {
            name: '六体',
            desc: '当一名与你势力相同的角色于其一个出牌阶段内使用或打出第X张牌时，其可以观看牌堆顶的两张牌，获得其中一张牌，然后移存另一张牌（X为其计算与你的距离且至少为1）。',
            desc2: '①当牌于一名角色的出牌阶段内被使用/打出时，若使用者为该角色且其与你势力相同且其于此阶段内使用与打出过的牌数之和为X（X为其至你的距离），你发动此技能▶其可将牌堆顶的两张牌扣置入处理区（对其可见）。其获得这些牌中一张。将另一张置入后备区。\n②锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.peixiu/liuti1',
                    lang: '准望之法既正，曲直远近可知。',
                },
                {
                    url: 'generals/xl/xl.peixiu/liuti2',
                    lang: '制图须依定法，可为后世之范。',
                },
            ],
        },
        ['xl.peixiu.jingsi']: {
            name: '经笥',
            desc: '当你受到锦囊牌造成的伤害后，你可以弃置Y张后备区里的牌，然后回复1点体力（Y为你已损失的体力值）。',
            desc2: '①当你受到渠道的牌为锦囊牌的伤害后，你可弃置X张后备区里的牌（X为你已损失的体力值）▶回复1点体力。\n②锁定技，后备区的牌对你可见。',
            audios: [
                {
                    url: 'generals/xl/xl.peixiu/jingsi1',
                    lang: '处危不忘忧国，功臣当得善终。',
                },
                {
                    url: 'generals/xl/xl.peixiu/jingsi2',
                    lang: '经笥藏智亦藏拙，小损大益！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wangjun', {
    title: '起旌览胜',
    rs: '唐彬',
    death_audio: '千帆化作烽烟烬……',
    image_url: 'generals/xl/xl.wangjun/image',
    death_url: 'generals/xl/xl.wangjun/death',

    skills: {
        ['xl.wangjun.chenjiang']: {
            name: '沉江',
            desc: '你可以将非属性【杀】当火【杀】使用。\n当你使用造成火焰伤害的牌指定目标后，你可以弃置其一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wangjun/chenjiang1',
                    lang: '此等伎俩安能阻我？火船就位！',
                },
                {
                    url: 'generals/xl/xl.wangjun/chenjiang2',
                    lang: '乘风扬帆，全速前进！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.hufen', {
    title: '泾传震声',
    rs: '胡烈胡渊',
    death_audio: '只求，归葬故乡，伴水长眠……',
    image_url: 'generals/xl/xl.hufen/image',
    death_url: 'generals/xl/xl.hufen/death',

    skills: {
        ['xl.hufen.jiesha']: {
            name: '截杀',
            desc: '每轮限一次，其他角色的准备阶段，你可以弃置至多三张手牌，视为对其使用一张【杀】。此【杀】对其造成伤害后，你可以选择至多X项（X为你以此法弃置的牌数）：\n1.其于本回合摸牌阶段少摸一张牌；\n2.获得其区域内一张牌；\n3.令其一张已明置武将牌上的非锁定技失效直到回合结束。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.hufen/jiesha1',
                    lang: '追！休要走了诸葛老贼！',
                },
                {
                    url: 'generals/xl/xl.hufen/jiesha2',
                    lang: '此击必断敌归路！',
                },
                {
                    url: 'generals/xl/xl.hufen/jiesha3',
                    lang: '兵临施水，纵敌万军亦无能为也。',
                },
                {
                    url: 'generals/xl/xl.hufen/jiesha4',
                    lang: '焚掠浚遒，敌必乱而自伐。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.xiahouhui', {
    title: '深潭的青莲',
    rs: '',
    death_audio: '只怨生在帝王家……',
    image_url: 'generals/xl/xl.xiahouhui/image',
    death_url: 'generals/xl/xl.xiahouhui/death',

    skills: {
        ['xl.xiahouhui.yuchou']: {
            name: '豫筹',
            desc: '当你的牌因弃置而置入弃牌堆时，你可以选择一名其他角色并选择一项：\n1.令其摸等量的牌；\n2.交给其等量后备区的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.xiahouhui/yuchou1',
                    lang: '妾知有备无患，夫君可依妾计行事。',
                },
                {
                    url: 'generals/xl/xl.xiahouhui/yuchou2',
                    lang: '上忌浮华而崇五经，夫君何不从之。',
                },
            ],
        },
        ['xl.xiahouhui.lvbing']: {
            name: '履冰',
            desc: '锁定技，当你进入濒死状态时，若场上没有角色拥有“见隙”，你令伤害来源获得技能“见隙”。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.xiahouhui/lvbing1',
                    lang: '妾一片冰心，夫君何故疑我。',
                },
                {
                    url: 'generals/xl/xl.xiahouhui/lvbing2',
                    lang: '为妻数载，痴情俱作一觞苦酒……',
                },
            ],
        },
        ['xl.xiahouhui.jianxi']: {
            name: '见隙',
            desc: '锁定技，当你的牌因弃置而进入弃牌堆后，你移存一张牌。\n每名其他角色的回合限两次，当你获得牌时，你选择一项：\n1.弃置所有获得的牌；\n2.失去1点体力。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.xiahouhui/jianxi1',
                    lang: '定情之物，夫君何忍弃去。',
                },
                {
                    url: 'generals/xl/xl.xiahouhui/jianxi2',
                    lang: '吴氏女何德，竟致弃我如敝屣？',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wanghun', {
    title: '艨下千里',
    rs: '钟琰',
    death_audio: '吾洁身自好，只求保身于浊流……',
    image_url: 'generals/xl/xl.wanghun/image',
    death_url: 'generals/xl/xl.wanghun/death',

    skills: {
        ['xl.wanghun.cuiku']: {
            name: '摧枯',
            desc: '出牌阶段限一次，你可以弃置至少一张花色相同的手牌，令一名其他角色选择一项：\n1.受到你造成的1点伤害；\n2.令你弃置其等量的牌。（不足则全弃，没牌则不弃）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wanghun/cuiku1',
                    lang: '敌军锐气已尽，当倾军而出！',
                },
                {
                    url: 'generals/xl/xl.wanghun/cuiku2',
                    lang: '什么丹阳青巾，我视如貉犬尔。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.zhongyan', {
    title: '莺咏一族',
    rs: '王浑',
    death_audio: '嗟尔姜任，邈不我留。',
    image_url: 'generals/xl/xl.zhongyan/image',
    death_url: 'generals/xl/xl.zhongyan/death',

    skills: {
        ['xl.zhongyan.xiasi']: {
            name: '遐思',
            desc: '结束阶段，你可以展示所有手牌（无牌则跳过），若你的手牌花色均不相同，你可以亮出牌堆中你手牌没有的花色的牌各一张并获得之。（若牌堆没有则从弃牌堆随机获得）',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhongyan/xiasi1',
                    lang: '坐虚堂而无寥，嗟我心之多怀。',
                },
                {
                    url: 'generals/xl/xl.zhongyan/xiasi2',
                    lang: '悲民生之局促，原轻举之遐翔。',
                },
            ],
        },
        ['xl.zhongyan.lifa']: {
            name: '礼法',
            desc: '一名与你势力相同的其他角色摸牌阶段结束时，你可以交给其一张牌，然后其交给你一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhongyan/lifa1',
                    lang: '尊而不凌，卑而不趋，是为礼也。',
                },
                {
                    url: 'generals/xl/xl.zhongyan/lifa2',
                    lang: '妯娌和睦，乃家门之幸啊。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.tangbin', {
    title: '抚宁疆场',
    rs: '王濬',
    death_audio: '臣见机行事，君上为何疑我？',
    image_url: 'generals/xl/xl.tangbin/image',
    death_url: 'generals/xl/xl.tangbin/death',

    skills: {
        ['xl.tangbin.suiyu']: {
            name: '绥御',
            desc: '当你于回合内使用的基本牌或普通锦囊牌进入弃牌堆时，若后备区里没有与此牌花色相同的牌，你可以移存牌堆顶一张相同花色的牌（若没有则从弃牌堆内随机移存）。\n当一名与你势力相同的角色于其回合外成为牌的目标后，你可以弃置后备区里一张与此牌花色相同的牌，令其摸一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.tangbin/suiyu1',
                    lang: '亡羊补牢，为时未晚矣。',
                },
                {
                    url: 'generals/xl/xl.tangbin/suiyu2',
                    lang: '军资齐备，何惧乌合之贼。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.huliehuyuan', {
    title: '忠魂烈骨',
    rs: '胡奋',
    death_audio: '既临战场，何惧生死，啊！',
    image_url: 'generals/xl/xl.huyuanhulie/image',
    image_self_url: 'generals/xl/xl.huliehuyuan/image',
    image_dual_url: 'generals/xl/xl.huliehuyuan/image.dual',
    death_url: 'generals/xl/xl.huliehuyuan/death',

    skills: {
        ['xl.huliehuyuan.fenmie']: {
            name: '焚灭',
            desc: '出牌阶段限一次，你可以失去1点体力，视为使用 ß一张火【杀】。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.huliehuyuan/fenmie1',
                    lang: '烈火焚营，烧尽敌军辎重。',
                },
                {
                    url: 'generals/xl/xl.huliehuyuan/fenmie2',
                    lang: '此心炽热，燃灭叛贼。',
                },
            ],
        },
        ['xl.huliehuyuan.dangpan']: {
            name: '荡叛',
            desc: '锁定技，你使用火【杀】无次数限制。\n当你对野心家势力或有暗置武将牌的角色造成伤害后，你摸一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.huliehuyuan/dangpan1',
                    lang: '人心难测，休怪吾等无情。',
                },
                {
                    url: 'generals/xl/xl.huliehuyuan/dangpan2',
                    lang: '汝大逆不道，该杀，该杀！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.lord_simayan', {
    title: '狼图天下',
    rs: '晋势力武将',
    death_audio: '只求，治世能续……',
    image_url: 'generals/xl/xl.lord_simayan/image',
    death_url: 'generals/xl/xl.lord_simayan/death',

    skills: {
        ['xl.lord_simayan.taishi']: {
            name: '泰始',
            desc: '君主技，你拥有“八公弼政疏”。\n首轮结束时，你令所有非晋势力君主武将替换为对应的普通武将。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/taishi1',
                    lang: '八公同辰，佑大晋万寿无疆。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/taishi2',
                    lang: '三分归统，便在我司马一族。',
                },
            ],
        },

        ['xl.lord_simayan.bagongbizhengshu']: {
            name: '八公弼政疏',
            desc: '锁定技，后备区的牌无数量限制。\n当你于回合外失去最后的手牌时，你弃置一半（向下取整）后备区里明区的牌。\n晋势力角色的出牌阶段每项各限一次：\n1.其可以移存一张非基本手牌；\n2.其可以使用后备区明区的一张牌。\n当非晋势力角色死亡时，若后备区里的牌数不小于8，你可以令所有晋势力角色摸一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/bagongbizhengshu1',
                    lang: '爱卿及时贡赋，甚好甚好。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/bagongbizhengshu2',
                    lang: '朕在洛阳，祝卿功成名就。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/bagongbizhengshu3',
                    lang: '朕的钱！这都是朕的钱！',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/bagongbizhengshu4',
                    lang: '吴贼已破，当与卿等共饮此杯！',
                },
            ],
        },

        ['xl.lord_simayan.guitong']: {
            name: '归统',
            desc: '锁定技，你获得被禁用势力的君主武将的对应技能（“挥鞭”“激诏”“敛资”“悟心”），并将描述内的势力改为“晋”，“授钺”改为“泰始”。',
            desc2: '',
            audios: [],
        },

        ['xl.lord_simayan.yubao']: {
            name: '御宝',
            desc: '出牌阶段限一次，你可以移存一张不为【赤宝珊瑚】的手牌，获得场上、弃牌堆中或后备区里的一张【赤宝珊瑚】并使用之。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/yubao1',
                    lang: '此宝必可佑朕得胜。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/yubao2',
                    lang: '收敛民间珍宝，以充国库。',
                },
            ],
        },

        ['xl.lord_simayan.huibian']: {
            name: '挥鞭',
            desc: '出牌阶段限一次，你可以选择一名已受伤的晋势力角色和另一名晋势力角色，你对后者造成1点伤害，然后令其摸两张牌，令已受伤的前者回复1点体力。',
            desc2: '出牌阶段限一次，你可选择一名晋势力角色和另一名已受伤的晋势力角色并对前者造成1点普通伤害▶前者摸两张牌，后者回复1点体力。',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/huibian1',
                    lang: '天下既平，宜去州郡武备。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/huibian2',
                    lang: '迁外夷入华夏，可充实丁口。',
                },
            ],
        },

        ['xl.lord_simayan.jizhao']: {
            name: '激诏',
            desc: '限定技，当你处于濒死状态时，你可以将手牌补至体力上限，然后你将体力回复至2点，失去“泰始”，获得“仁德”。',
            desc2: '限定技，当你处于濒死状态时，你可将你的手牌补至X张（X为你的体力上限）▶你将体力回复至2点，失去〖泰始〗并获得〖仁德〗。',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/jizhao1',
                    lang: '勋贵占田，果国之大蠹也。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/jizhao2',
                    lang: '今若不伐吴，吾必行曹魏之覆辙矣。',
                },
            ],
        },

        ['xl.lord_simayan.rende']: {
            name: '仁德',
            desc: '出牌阶段每名角色限一次，你可以将任意张手牌交给一名其他角色，当你以此法给出第二张牌时，你可以视为使用一张基本牌。',
            desc2:
                '出牌阶段，你可将至少一张手牌交给一名角色▶你于此阶段内不能再次对这些角色发动此技能。若你于此阶段内因执行此技能的消耗而交给其他角色的手牌数大于1且于此次发动此技能之前于此阶段内因执行此技能的消耗而交给其他角色的手牌数小于2，你可使用无对应的实体牌的基本牌。\n' +
                '◆若你因执行〖仁德〗的效果而使用【杀】，你须声明是使用哪种【杀】，且你因使用此【杀】而进行的合法性检测的规则中，由此牌的牌面信息中的“使用目标”产生的规则改为“你的攻击范围内的其他角色”且此【杀】计入限制的次数。',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/rende1',
                    lang: '命尔为将，来日下江攻吴！',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/rende2',
                    lang: '增南境武备，以备不时之需。',
                },
            ],
        },

        ['xl.lord_simayan.lianzi']: {
            name: '敛资',
            desc: '出牌阶段限一次，你可以弃置一张手牌，然后亮出牌堆顶X张牌，你获得其中所有与你弃置牌类别相同的牌，将其余的牌置入弃牌堆。若你获得的牌数大于3，你失去“敛资”，获得“制衡”。（X为所有晋势力角色装备区里的牌数和“烽火”的之和）',
            desc2: '出牌阶段限一次，你可弃置一张手牌▶你亮出牌堆顶的X张牌（X为所有晋势力角色装备区里的牌数与“烽火”数之和），获得你以此法亮出的这些牌中的所有与你以此法弃置的牌类别相同的牌。若你以此法得到的牌数大于3，你失去〖敛资〗，获得〖制衡〗。',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/lianzi1',
                    lang: '天下珍宝，皆入吾彀中！',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/lianzi2',
                    lang: '齐王攸声名震主，当除之。',
                },
            ],
        },

        ['xl.lord_simayan.zhiheng']: {
            name: '制衡',
            desc: '出牌阶段限一次，你可以弃置至多X张牌（X为你的体力上限），然后摸等量的牌。',
            desc2: '出牌阶段限一次，你可弃置至多X张牌（X为你的体力上限）▶你摸等量的牌。',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/zhiheng1',
                    lang: '命君为临晋侯，望君知我意。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/zhiheng2',
                    lang: '有皇叔国丈共佐，我儿无忧宜。',
                },
            ],
        },

        ['xl.lord_simayan.wuxin']: {
            name: '悟心',
            desc: '摸牌阶段开始时，你可以观看牌堆顶的X张牌，然后将这些牌以任意顺序置于牌堆顶。（X为存活的晋势力角色数）',
            desc2: '摸牌阶段开始时❷，你可观看牌堆顶的X张牌并可改变这些牌的顺序。（X为晋势力角色数）',
            audios: [
                {
                    url: 'generals/xl/xl.lord_simayan/wuxin1',
                    lang: '郑氏经学，真乃天下第一。',
                },
                {
                    url: 'generals/xl/xl.lord_simayan/wuxin2',
                    lang: '朕当体天牧民，永昌后嗣。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.yanghu', {
    title: '闻碑堕泪',
    rs: '杜预',
    death_audio: '取吴不必须臣自行，元凯可继也……',
    image_url: 'generals/xl/xl.yanghu/image',
    death_url: 'generals/xl/xl.yanghu/death',

    skills: {
        ['xl.yanghu.deshao']: {
            name: '德劭',
            desc: '当你抵消其他角色使用的牌或你使用的牌被其他角色抵消后，你可以移存被抵消的牌，然后若你没有“阴阳鱼”标记，你可以获得一个“阴阳鱼”标记。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.yanghu/deshao1',
                    lang: '吴有江南已历三世，不可急图。',
                },
                {
                    url: 'generals/xl/xl.yanghu/deshao2',
                    lang: '公赠以木桃，我报以琼瑶。',
                },
            ],
        },

        ['xl.yanghu.xuantao']: {
            name: '宣讨',
            desc: '每轮限一次，一名与你势力不同的角色的出牌阶段开始时，你可以弃置一张牌，然后弃置后备区里一张能造成伤害的牌，视为仅对其使用此牌；当你以此法造成伤害后，你摸一张牌，否则此技能视为未发动过。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.yanghu/xuantao1',
                    lang: '先声夺人，一举克定西陵！',
                },
                {
                    url: 'generals/xl/xl.yanghu/xuantao2',
                    lang: '吾闻兵有拙速，不贵工迟也。',
                },
            ],
        },

        ['xl.yanghu.chonge']: {
            name: '冲轭',
            desc: '阵法技，当一名与你处于同一队列的角色成为【决斗】或【杀】的目标后，其可以打出一张相同花色的手牌抵消之。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.yanghu/chonge1',
                    lang: '昔伯舆凿运以通军道，吾当随之。',
                },
                {
                    url: 'generals/xl/xl.yanghu/chonge2',
                    lang: '荆襄水陆阡陌，正宜左右相协。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.duyu', {
    title: '允文允武',
    rs: '羊祜',
    death_audio: '古不合葬，明于终始之理，同于无有也……',
    image_url: 'generals/xl/xl.duyu/image',
    death_url: 'generals/xl/xl.duyu/death',

    skills: {
        ['xl.duyu.huaijing']: {
            name: '怀经',
            desc: '当你明置此武将牌后，你可以移存牌堆顶的三张牌。\n准备阶段，你可以观看牌堆顶的三张牌，选择其中任意张牌替换后备区等量的牌，然后将替换后的牌以任意顺序放置于牌堆顶。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.duyu/huaijing1',
                    lang: '胸藏万卷，自可运筹帷幄。',
                },
                {
                    url: 'generals/xl/xl.duyu/huaijing2',
                    lang: '于敌前而先动，于战前而先思。',
                },
            ],
        },

        ['xl.duyu.zhigong']: {
            name: '致功',
            desc: '主将技，出牌阶段结束时，若此阶段内有其他势力的角色死亡，你可以获得后备区里X张牌，然后执行一个额外的出牌阶段（X为本回合发动此技能的次数）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.duyu/zhigong1',
                    lang: '荆州既克，荡平三吴指日可待。',
                },
                {
                    url: 'generals/xl/xl.duyu/zhigong2',
                    lang: '我军势如破竹，一举破链吞吴。',
                },
            ],
        },

        ['xl.duyu.shannong']: {
            name: '缮农',
            desc: '副将技，此武将牌上单独的阴阳鱼个数-1。\n一名与你势力相同的角色的结束阶段，你可以使用一张后备区里的牌，当此牌结算后，若此牌造成过伤害，你令当前回合角色移存一张手牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.duyu/shannong1',
                    lang: '荆襄苦暴吴久矣，不可再加横赋。',
                },
                {
                    url: 'generals/xl/xl.duyu/shannong2',
                    lang: '缮水建学，方可利国强军。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.weiguan', {
    title: '绵章有折',
    rs: '',
    death_audio: '刀俎一世，鱼肉一时……',
    image_url: 'generals/xl/xl.weiguan/image',
    death_url: 'generals/xl/xl.weiguan/death',

    skills: {
        ['xl.weiguan.zhimie']: {
            name: '智灭',
            desc: '出牌阶段限一次，你使用普通锦囊牌仅指定一名其他角色为目标时，你可以额外选择至多三名处于连环状态的其他角色为目标。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.weiguan/zhimie1',
                    lang: '三贤缚于一线，不过提笔间事。',
                },
                {
                    url: 'generals/xl/xl.weiguan/zhimie2',
                    lang: '邓钟姜各怀异心，不可不尽除。',
                },
            ],
        },

        ['xl.weiguan.shenpin']: {
            name: '神品',
            desc: '当你使用的黑色牌被其他角色抵消后，你可以令其横置。\n当其他角色使用黑色牌指定你为目标时，你可以令其选择一项：\n1.取消之；\n2.横置；\n3.若其处于连环状态，弃置两张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.weiguan/shenpin1',
                    lang: '笔走龙蛇，破尔虚妄。',
                },
                {
                    url: 'generals/xl/xl.weiguan/shenpin2',
                    lang: '墨韵天成，岂容尔辈妄评。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.zhouzhi', {
    title: '以计代战',
    rs: '',
    death_audio: '报国身死他乡，壮哉！烈哉！',
    image_url: 'generals/xl/xl.zhouzhi/image',
    death_url: 'generals/xl/xl.zhouzhi/death',

    skills: {
        ['xl.zhouzhi.dangwan']: {
            name: '当万',
            desc: '锁定技，当你使用非转化的【杀】或【决斗】指定小势力角色为目标后，若你为大势力角色，其弃置一张手牌。\n当场上进行势力大小的判断时，你所属的势力的角色数+X（X为你装备区里的牌数）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhouzhi/dangwan1',
                    lang: '遍张旗帜于要害，虚也？实也？',
                },
                {
                    url: 'generals/xl/xl.zhouzhi/dangwan2',
                    lang: '乐乡夜半火起，灯乎？兵乎？',
                },
            ],
        },

        ['xl.zhouzhi.anfu']: {
            name: '暗伏',
            desc: '出牌阶段限一次，当其他角色失去最后的手牌后，若其副将有武将牌，你可以令其选择一项：\n1.其移除副将的武将牌；\n2.令你获得其装备区里的一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhouzhi/anfu1',
                    lang: '哈！开门揖盗。',
                },
                {
                    url: 'generals/xl/xl.zhouzhi/anfu2',
                    lang: '嘘，暗度陈仓。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.malong', {
    title: '风后再世',
    rs: '',
    death_audio: '凉州未安，马隆……有愧……',
    image_url: 'generals/xl/xl.malong/image',
    death_url: 'generals/xl/xl.malong/death',

    skills: {
        ['xl.malong.woqi']: {
            name: '握奇',
            desc: '当你首次明置此武将牌时，背面向上移存游戏外的【犀甲】【偏厢车】【磁石阵】【八阵总述】，并使用【八阵总述】。\n准备阶段，你可以将后备区里、场上或你手牌中【犀甲】【偏厢车】【磁石阵】【八阵总述】的其中一张置入一名与你势力相同的角色的装备区，若其装备区有牌可以替换之。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.malong/woqi1',
                    lang: '披犀甲，布磁石，此战必胜。',
                },
                {
                    url: 'generals/xl/xl.malong/woqi2',
                    lang: '让铁甲尝尝磁石的厉害。',
                },
                {
                    url: 'generals/xl/xl.malong/woqi3',
                    lang: '这甲胄能卸去七分力道。',
                },
                {
                    url: 'generals/xl/xl.malong/woqi4',
                    lang: '车阵展开，随地形而变。',
                },
                {
                    url: 'generals/xl/xl.malong/woqi5',
                    lang: '八阵轮转，敌寇难测我机。',
                },
            ],
        },

        ['xl.malong.zhendian']: {
            name: '阵典',
            desc: '锁定技，与你势力相同的角色的回合内，视为所有与你势力相同的角色处于同一队列。',
            desc2: '',
            audios: [],
        },

        ['xl.malong.chonge']: {
            name: '冲轭',
            desc: '',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.malong/chongyu',
                    lang: '破围之势，当以死士开路！',
                },
            ],
        },

        ['xl.malong.kanpo']: {
            name: '看破',
            desc: '',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.malong/kanpo',
                    lang: '天网罩四野，敌寇无隙可逃。',
                },
            ],
        },

        ['xl.malong.niaoxiang']: {
            name: '鸟翔',
            desc: '',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.malong/niaoxiang',
                    lang: '轻骑掠阵，合围之势已成。',
                },
            ],
        },

        ['xl.malong.fengshi']: {
            name: '锋矢',
            desc: '',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.malong/fengshi',
                    lang: '行阵如箭，以剿敌军腹地！',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.shantao', {
    title: '璞玉浑金',
    rs: '',
    death_audio: '臣垂没之人，岂可污朝堂乎……',
    image_url: 'generals/xl/xl.shantao/image',
    death_url: 'generals/xl/xl.shantao/death',

    skills: {
        ['xl.shantao.lunbei']: {
            name: '论备',
            desc: '准备阶段，你可以选择一项：\n1.令一名与你势力相同的角色摸一张牌，然后你可以令其变更副将（本局游戏限两次）；\n2.令一名其他角色弃置一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.shantao/lunbei1',
                    lang: '汝既不才，何以忝居高位？',
                },
                {
                    url: 'generals/xl/xl.shantao/lunbei2',
                    lang: '此位当属汝南袁氏遗才。',
                },
            ],
        },
        ['xl.shantao.qishi']: {
            name: '启事',
            desc: '一名与你势力相同的角色变更副将时，你可以令其改为获得每个势力的备选武将牌各一张。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.shantao/qishi1',
                    lang: '宇内既统，当招揽天下英才。',
                },
                {
                    url: 'generals/xl/xl.shantao/qishi2',
                    lang: '冀州三十士，当耀于朝。',
                },
            ],
        },
        ['xl.shantao.yifu']: {
            name: '义抚',
            desc: '限定技，当一名与你势力相同的其他角色死亡后，你可以令其在你的下家以2体力武将“嵇绍”重新加入游戏，然后其摸两张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.shantao/yifu1',
                    lang: '叔夜知吾义，吾必不负其心。',
                },
                {
                    url: 'generals/xl/xl.shantao/yifu2',
                    lang: '稚子无辜，当护其周全。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.jishao', {
    title: '中散遗孤',
    rs: '',
    death_audio: '山伯伯，你在哪里呀……',
    image_url: 'generals/xl/xl.jishao/image',
    death_url: 'generals/xl/xl.jishao/death',

    skills: {
        ['xl.jishao.bugu']: {
            name: '不孤',
            desc: '*此武将为衍生武将牌不加入将池\n一名与你势力相同的其他角色的准备阶段，其可以交给你一张牌。\n当你即将被其他角色弃置或获得牌时，与你势力相同的其他角色可代替你结算。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.jishao/bugu1',
                    lang: '一饭之恩，永怀于心。',
                },
                {
                    url: 'generals/xl/xl.jishao/bugu2',
                    lang: '欺负小孩子，算什么本事。',
                },
            ],
        },
        ['xl.jishao.xiangan']: {
            name: '乡安',
            desc: '*此武将为衍生武将牌不加入将池\n锁定技，你以单将模式角色加入游戏。\n你的势力始终和山涛相同。\n与你势力不同的其他角色计算与你的距离时+1。\n当山涛死亡时，你失去此武将牌上的所有技能。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.jishao/xiangan1',
                    lang: '山伯伯，我定不辜负您的教诲。',
                },
                {
                    url: 'generals/xl/xl.jishao/xiangan2',
                    lang: '庭前九曲廊，可阻豺狼步。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.simashi', {
    title: '晋室的掌旗者',
    rs: '羊徽瑜 司马昭',
    death_audio: '眇目何碍……只恨……未见……九鼎归一……',
    image_url: 'generals/xl/xl.simashi/image',
    death_url: 'generals/xl/xl.simashi/death',

    skills: {
        ['xl.simashi.ruilue']: {
            name: '睿略',
            desc: '一名与你势力不同的非野心家角色的结束阶段，若该角色此回合对与你势力相同的角色造成过伤害，你可以弃置一张牌，令其执行一次“军令”；\n若其不执行，你可以选择一名与其势力相同的非君主角色，将其势力改为野心家。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.simashi/ruilue1',
                    lang: '魏室倾颓，当以非常之策正纲纪。',
                },
                {
                    url: 'generals/xl/xl.simashi/ruilue2',
                    lang: '三军听令，违者当以叛国论处。',
                },
            ],
        },
        ['xl.simashi.fuluan']: {
            name: '抚乱',
            desc: '锁定技，当你使用【杀】或普通锦囊牌指定其他野心家势力角色为目标后，除非该角色弃置一张牌，否则其不可响应此牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.simashi/fuluan1',
                    lang: '逆鳞触之则死，还不速速弃甲。',
                },
                {
                    url: 'generals/xl/xl.simashi/fuluan2',
                    lang: '乱臣之血，当祭我大晋旌旗。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.yanghuiyu', {
    title: '俪皇协运',
    rs: '司马师',
    death_audio: '生逢乱世，得见太平……',
    image_url: 'generals/xl/xl.yanghuiyu/image',
    death_url: 'generals/xl/xl.yanghuiyu/death',

    skills: {
        ['xl.yanghuiyu.shenyi']: {
            name: '慎仪',
            desc: '当一名角色不以此法获得“先驱”、“阴阳鱼”或“珠联璧合”标记时，你可以令另一名角色获得一个“阴阳鱼”标记。\n当一名角色使用“阴阳鱼”或“珠联璧合”标记时，你可以令一名角色执行此标记的另一项。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.yanghuiyu/shenyi1',
                    lang: '慎言礼行，表国容之仪。',
                },
                {
                    url: 'generals/xl/xl.yanghuiyu/shenyi2',
                    lang: '温行仪弘，以彰贤淑惠德。',
                },
            ],
        },
        ['xl.yanghuiyu.ciwei']: {
            name: '慈威',
            desc: '出牌阶段限一次，你可以将任意张手牌交给一名其他角色，然后获得其区域里至多X-1张牌，若X大于其体力值，你可令其回复1点体力（X为你交出的手牌数）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.yanghuiyu/ciwei1',
                    lang: '教以慈言立威，成以定国根本。',
                },
                {
                    url: 'generals/xl/xl.yanghuiyu/ciwei2',
                    lang: '慈教谨心，只求攸儿平安。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wangxiang', {
    title: '履冰执幕',
    rs: '',
    death_audio: '夫生之有死，自然之理……',
    image_url: 'generals/xl/xl.wangxiang/image',
    death_url: 'generals/xl/xl.wangxiang/death',

    skills: {
        ['xl.wangxiang.xiaosheng']: {
            name: '孝圣',
            desc: '当此武将牌首次因明置而翻转至正面朝上后，背面向上移存游戏外的【双鲤】【群雀】。\n当【双鲤】【群雀】置入与你势力不同的角色的装备区时，你可以将之背面向上移存。\n当你失去1点体力后，你可以将后备区里的一张牌交给一名角色',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wangxiang/xiaosheng1',
                    lang: '双鲤入怀，群雀环飞，此乃天赐丰年！',
                },
                {
                    url: 'generals/xl/xl.wangxiang/xiaosheng2',
                    lang: '仁义求诸己，破而后有立。',
                },
                {
                    url: 'generals/xl/xl.wangxiang/xiaosheng3',
                    lang: '常忆卧冰时，水寒心尚暖。',
                },
                {
                    url: 'generals/xl/xl.wangxiang/xiaosheng4',
                    lang: '复怀张幕日，黄雀朝凤来。',
                },
                {
                    url: 'generals/xl/xl.wangxiang/xiaosheng5',
                    lang: '家财不吝，只求徐州得返太平。',
                },
            ],
        },
        ['xl.wangxiang.qingda']: {
            name: '清达',
            desc: '每回合限一次，当你成为【杀】或普通锦囊牌的目标时，你可以失去1点体力，令此牌对一个势力的所有角色无效。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wangxiang/qingda1',
                    lang: '清德耀海沂，自可不战屈兵。',
                },
                {
                    url: 'generals/xl/xl.wangxiang/qingda2',
                    lang: '孝其亲，爱其民，方可显其名。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.luji_jin', {
    title: '鸿鹄之裴回',
    rs: '张华 周处',
    death_audio: '华亭鹤唳 ，岂可复闻乎……',
    image_url: 'generals/xl/xl.luji_jin/image',
    death_url: 'generals/xl/xl.luji_jin/death',

    skills: {
        ['xl.luji_jin.qinggang']: {
            name: '清刚',
            desc: '当其他角色使用的牌指定你为唯一目标时，你可以与其拼点：\n若你赢，取消之；\n若你没赢，此牌不可被响应。\n当你拼点时，若拼点牌的牌名字数相同，则视为你赢。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luji_jin/qinggang1',
                    lang: '吾等皆罪臣之后，何分高下。',
                },
                {
                    url: 'generals/xl/xl.luji_jin/qinggang2',
                    lang: '君若不友，愿以诗对较高下。',
                },
                {
                    url: 'generals/xl/xl.luji_jin/qinggang3',
                    lang: '羊酪对莼羹，甚合也！',
                },
            ],
        },
        ['xl.luji_jin.heli']: {
            name: '鹤唳',
            desc: '当你死亡时，与你势力相同的其他角色可以失去1点体力并摸三张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luji_jin/heli1',
                    lang: '颖，宠信奸佞，吾其决绝矣。',
                },
                {
                    url: 'generals/xl/xl.luji_jin/heli2',
                    lang: '冀州将乱，不如避之于江南。',
                },
            ],
        },
        ['xl.luji_jin.qinghe']: {
            name: '清河',
            desc: '回合开始时，你可以用陆云替换此武将牌。然后本回合“平原”失效。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luji_jin/qinghe',
                    lang: '吾弟陆清河善对，可求诸其也。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.luyun', {
    title: '悬鼓之待槌',
    rs: '张华 周处',
    death_audio: '唉，南人终不得见信于北……',
    image_url: 'generals/xl/xl.luyun/image',
    death_url: 'generals/xl/xl.luyun/death',

    skills: {
        ['xl.luyun.duisong']: {
            name: '对颂',
            desc: '*此武将为衍生武将牌不加入将池\n出牌阶段限一次，你可以弃置一张牌，令一名其他角色弃置一张牌。\n若这两张牌点数或牌名字数相同，你与其各摸一张牌；\n若均不同，你可以获得其区域里的一张牌。\n纵横：将“获得”改为“弃置”。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luyun/duisong1',
                    lang: '既开青云睹白雉，何不张尔弓，挟尔矢？',
                },
                {
                    url: 'generals/xl/xl.luyun/duisong2',
                    lang: '哈哈哈，妙对，妙对。',
                },
                {
                    url: 'generals/xl/xl.luyun/duisong3',
                    lang: '哈哈哈，大兄还是差一点啊。',
                },
            ],
        },
        ['xl.luyun.duisongzongheng']: {
            name: '对颂',
            desc: '出牌阶段限一次，你可以弃置一张牌，令一名其他角色弃置一张牌。\n若这两张牌点数或牌名字数相同，你与其各摸一张牌；\n若均不同，你可以弃置其区域里的一张牌。',
            desc2: '',
            audios: [],
        },
        ['xl.luyun.fengxu']: {
            name: '凤煦',
            desc: '*此武将为衍生武将牌不加入将池\n当此牌被替换、变更或移除时，你可以令一名角色回复1点体力。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luyun/fengxu1',
                    lang: '府君若不愿共事，我去便是。',
                },
                {
                    url: 'generals/xl/xl.luyun/fengxu2',
                    lang: '乡老怀恩若此，陆某感激不尽。',
                },
            ],
        },
        ['xl.luyun.pingyuan']: {
            name: '平原',
            desc: '回合开始时，你可以用陆机替换此武将牌。然后本回合“清河”失效。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.luyun/pingyuan',
                    lang: '吾兄陆平原善赋，可求诸其也。',
                },
            ],
        },
    },
});

export {};
