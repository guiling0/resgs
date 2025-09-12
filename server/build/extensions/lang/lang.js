"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
sgs.loadGeneralTranslation('wars.caocao', {
    title: '魏武帝',
    rs: '卞夫人 典韦 许褚',
    death_audio: '霸业未成，未成啊……',
    skills: {
        ['wars.caocao.jianxiong']: {
            name: '奸雄',
            desc: '当你受到伤害后，你可以获得造成此伤害的牌。',
            desc2: '当你受到伤害后，你可获得是此伤害的渠道的牌对应的所有实体牌。',
            audios: [
                {
                    url: 'generals/caocao/jianxiong1',
                    lang: '宁教我负天下人，休教天下人负我！',
                },
                {
                    url: 'generals/caocao/jianxiong2',
                    lang: '吾好梦中杀人！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simayi', {
    title: '狼顾之鬼',
    rs: '',
    death_audio: '我的气数就到这里了么……',
    skills: {
        ['wars.simayi.fankui']: {
            name: '反馈',
            desc: '当你受到伤害后，你可以获得伤害来源的一张牌。',
            desc2: '当你受到伤害后，你可获得来源的一张牌。',
            audios: [
                {
                    url: 'generals/simayi/fankui1',
                    lang: '哼！正中下怀！',
                },
                {
                    url: 'generals/simayi/fankui2',
                    lang: '哼！自作孽不可活！',
                },
            ],
        },
        ['wars.simayi.guicai']: {
            name: '鬼才',
            desc: '当一名角色的判定牌生效前，你可以打出一张牌代替之。',
            desc2: '当判定结果确定前，你可打出对应的实体牌是你的一张牌且与此牌牌名相同的牌▶系统将此牌作为判定牌，将原判定牌置入弃牌堆。\n' +
                '◆你发动〖鬼才〗开始的打出流程结束之前，不会插入默认的系统将此判定牌置入弃牌堆的移动事件。',
            audios: [
                {
                    url: 'generals/simayi/guicai1',
                    lang: '才通天地，逆天改命！',
                },
                {
                    url: 'generals/simayi/guicai2',
                    lang: '天命难违？哈哈哈哈哈哈！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xiahoudun', {
    title: '独眼的罗刹',
    rs: '夏侯渊 于禁',
    death_audio: '两…两边都看不见了……',
    skills: {
        ['wars.xiahoudun.ganglie']: {
            name: '刚烈',
            desc: '当你受到伤害后，你可以进行判定，若结果不为红桃，伤害来源选择一项：\n1.弃置两张手牌；\n2.受到1点伤害。',
            desc2: '当你受到伤害后，你可判定▶若结果不为红桃，来源选择：1.弃置两张手牌；2.受到你造成的1点普通伤害。',
            audios: [
                {
                    url: 'generals/xiahoudun/ganglie1',
                    lang: '鼠辈，竟敢伤我！',
                },
                {
                    url: 'generals/xiahoudun/ganglie2',
                    lang: '以彼之道，还施彼身！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhangliao', {
    title: '前将军',
    rs: '臧霸',
    death_audio: '被敌人占了先机，呃啊…………',
    skills: {
        ['wars.zhangliao.tuxi']: {
            name: '突袭',
            desc: '摸牌阶段，你可以少摸任意张牌，然后获得等量名其他角色的各一张手牌。',
            desc2: '摸牌阶段，你可令额定摸牌数-X并选择等量的有手牌的其他角色（X∈[1,你发动此技能前的额定摸牌数终值]）▶你获得这些角色的各一张手牌。',
            audios: [
                {
                    url: 'generals/zhangliao/tuxi1',
                    lang: '快马突袭，占尽先机。',
                },
                {
                    url: 'generals/zhangliao/tuxi2',
                    lang: '马似飞影，枪如霹雳。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xuchu', {
    title: '虎痴',
    rs: '曹操',
    death_audio: '冷，好冷啊…………',
    skills: {
        ['wars.xuchu.luoyi']: {
            name: '裸衣',
            desc: '摸牌阶段结束时，你可以弃置一张牌，然后你本回合使用【杀】或【决斗】造成的伤害+1。',
            desc2: '摸牌阶段结束时，你可弃置一张牌▶（→）当你于此回合内因执行【杀】或【决斗】的效果而对一名角色造成伤害时❶，若使用者为你，你令伤害值+1。',
            audios: [
                {
                    url: 'generals/xuchu/luoyi1',
                    lang: '脱！',
                },
                {
                    url: 'generals/xuchu/luoyi2',
                    lang: '谁来与我大战三百回合！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.guojia', {
    title: '早终的先知',
    rs: '',
    death_audio: '咳，咳……',
    skills: {
        ['wars.guojia.tiandu']: {
            name: '天妒',
            desc: '当你的判定牌生效后，你可以获得此牌。',
            desc2: '当你的判定结果确定后❷，你可获得判定牌。',
            audios: [
                {
                    url: 'generals/guojia/tiandu1',
                    lang: '就这样吧。',
                },
                {
                    url: 'generals/guojia/tiandu2',
                    lang: '哦？',
                },
            ],
        },
        ['wars.guojia.yiji']: {
            name: '遗计',
            desc: '当你受到伤害后，你可以观看牌堆顶的两张牌，然后将这些牌交给任意角色。',
            desc2: '当你受到伤害后，你可将牌堆顶的两张牌扣置入处理区（对你可见）▶你选择：1.将其中的一张交给一名其他角色，将另一张交给一名角色；2.将这两张牌交给一名角色。',
            audios: [
                {
                    url: 'generals/guojia/yiji1',
                    lang: '也好。',
                },
                {
                    url: 'generals/guojia/yiji2',
                    lang: '罢了。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhenji', {
    title: '薄幸的美人',
    rs: '曹丕',
    death_audio: '悼良会之永绝兮，哀一逝而异乡。',
    skills: {
        ['wars.zhenji.luoshen']: {
            name: '洛神',
            desc: '准备阶段，你可以进行判定，若结果为黑色，你可以重复此流程。然后你获得所有的黑色判定牌。',
            desc2: '准备阶段开始时，你可判定▶若结果为黑色，你可重复此流程。你获得所有的黑色判定牌。\n' +
                '◆此流程即"你判定。若结果为黑色，你可重复此流程"。在此流程中的判定流程结束之前，若结果为黑色，不会插入默认的系统将此判定牌置入弃牌堆的移动事件。',
            audios: [
                {
                    url: 'generals/zhenji/luoshen1',
                    lang: '髣髴兮若轻云之蔽月。',
                },
                {
                    url: 'generals/zhenji/luoshen2',
                    lang: '飘飖兮若流风之回雪。',
                },
            ],
        },
        ['wars.zhenji.qingguo']: {
            name: '倾国',
            desc: '你可以将一张黑色手牌当【闪】使用或打出。',
            desc2: '当你需要使用/打出【闪】时❸，你可使用/打出对应的实体牌为你的一张黑色手牌的【闪】。',
            audios: [
                {
                    url: 'generals/zhenji/qingguo1',
                    lang: '凌波微步，罗袜生尘。',
                },
                {
                    url: 'generals/zhenji/qingguo2',
                    lang: '体迅飞凫，飘忽若神。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xiahouyuan', {
    title: '疾行的猎豹',
    rs: '夏侯惇',
    death_audio: '竟然比我还…快……',
    skills: {
        ['wars.xiahouyuan.shensu']: {
            name: '神速',
            desc: '你可以做出如下选择：\n1.跳过判定阶段和摸牌阶段。\n2.跳过出牌阶段并弃置一张装备牌。\n你每选择一项，便视为你使用一张无距离限制的【杀】。',
            desc2: '①判定阶段开始前，你可跳过此阶段和摸牌阶段并选择是你使用无对应的实体牌的普【杀】的合法目标的一名角色▶你对其使用无对应的实体牌的普【杀】。②出牌阶段开始前，若你未跳过过此阶段，你可弃置一张装备牌并选择是你使用无对应的实体牌的普【杀】的合法目标的一名角色▶你对其使用无对应的实体牌的普【杀】，跳过此阶段。',
            audios: [
                {
                    url: 'generals/xiahouyuan/shensu1',
                    lang: '吾善于千里袭人！',
                },
                {
                    url: 'generals/xiahouyuan/shensu2',
                    lang: '取汝首级犹如探囊取物！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhanghe', {
    title: '料敌机先',
    rs: '',
    death_audio: '呃，膝盖中箭了……',
    skills: {
        ['wars.zhanghe.qiaobian']: {
            name: '巧变',
            desc: '你可以弃置一张手牌并跳过一个阶段：\n若跳过摸牌阶段，你可以获得至多两名角色的各一张手牌；\n若跳过出牌阶段，你可以移动场上的一张牌。',
            desc2: '①判定阶段开始前或弃牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段。②摸牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段，可选择至多两名有手牌的其他角色，获得这些角色的各一张手牌。③出牌阶段开始前，若你未跳过过此阶段，你可弃置一张手牌▶你跳过此阶段，可将一名角色的判定/装备区里的一张牌置入另一名角色的判定/装备区。',
            audios: [
                {
                    url: 'generals/zhanghe/qiaobian1',
                    lang: '兵无常势，水无常形。',
                },
                {
                    url: 'generals/zhanghe/qiaobian2',
                    lang: '用兵之道，变化万千。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xuhuang', {
    title: '周亚夫之风',
    rs: '',
    death_audio: '一顿不吃饿得慌……',
    skills: {
        ['wars.xuhuang.duanliang']: {
            name: '断粮',
            desc: '出牌阶段，你可以将一张黑色基本牌或黑色装备牌当一张【兵粮寸断】使用；\n你使用【兵粮寸断】无距离限制；\n若你对距离超过2的角色使用【兵粮寸断】，则本回合不能在发动"断粮"。',
            desc2: '①当你需要使用【兵粮寸断】时❸，你可使用对应的实体牌为你的一张不为锦囊牌的黑色牌的【兵粮寸断】▶若你至曾是此牌的目标对应的角色的的角色距离大于2，你于此回合内不能发动此技能。②你使用【兵粮寸断】无距离关系的限制。',
            audios: [
                {
                    url: 'generals/xuhuang/duanliang1',
                    lang: '截其源，断其粮，贼可擒也。',
                },
                {
                    url: 'generals/xuhuang/duanliang2',
                    lang: '人是铁，饭是钢。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.caoren', {
    title: '大将军',
    rs: '曹洪',
    death_audio: '长江以南，再无王土矣……',
    skills: {
        ['wars.caoren.jushou']: {
            name: '据守',
            desc: '结束阶段，你可以摸X张牌(X为亮明势力数)，然后弃置一张手牌。\n若以此法弃置的是装备牌，则改为你使用之。\n若X大于2，则你将武将牌叠置。',
            desc2: '结束阶段开始时，你可获得1枚"据"▶你摸X张牌，选择：1.弃置一张不为装备牌的手牌；2.使用一张对应的所有实体牌均为手牌的装备牌。若X大于2，你叠置。（X为势力数）',
            audios: [
                {
                    url: 'generals/caoren/jushou1',
                    lang: '兵精粮足，守土一方。',
                },
                {
                    url: 'generals/caoren/jushou2',
                    lang: '坚守此地，不退半步。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.dianwei', {
    title: '古之恶来',
    rs: '曹操',
    death_audio: '主公！快走……',
    skills: {
        ['wars.dianwei.qiangxi']: {
            name: '强袭',
            desc: '出牌阶段限一次，你可以失去1点体力或弃置一张武器牌，并对你攻击范围内的一名其他角色造成1点伤害。',
            desc2: '出牌阶段限一次，你可选择你的攻击范围内的一名角色并选择：{1.失去1点体力；2.弃置一张武器牌}▶若你：存活，你对其造成1点普通伤害；已死亡，其受到1点无来源的普通伤害。',
            audios: [
                {
                    url: 'generals/dianwei/qiangxi1',
                    lang: '吃我一戟！',
                },
                {
                    url: 'generals/dianwei/qiangxi2',
                    lang: '看我三步之内取你小命！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xunyu', {
    title: '王佐之才',
    rs: '荀攸',
    death_audio: '主公要臣死，臣不得不死。',
    skills: {
        ['wars.xunyu.quhu']: {
            name: '驱虎',
            desc: '出牌阶段限一次，你可以与一名体力值大于你的角色拼点：\n若你赢，该角色对其攻击范围内你选择的一名角色造成1点伤害；\n若你没赢，该角色对你造成1点伤害。',
            desc2: '出牌阶段限一次，你可与一名体力值大于你的角色拼点▶若你：赢，其对其攻击范围内你选择的一名角色造成1点普通伤害；未赢，其对你造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/xunyu/quhu1',
                    lang: '此乃驱虎吞狼之计。',
                },
                {
                    url: 'generals/xunyu/quhu2',
                    lang: '借你之手，与他一搏吧。',
                },
            ],
        },
        ['wars.xunyu.jieming']: {
            name: '节命',
            desc: '当你受到伤害后，你可以令一名角色将手牌摸至X张（X为其体力上限且最多为5）。',
            desc2: '当你受到伤害后，你可令一名角色将其手牌补至X张（X=min{其体力上限,5}）。',
            audios: [
                {
                    url: 'generals/xunyu/jieming1',
                    lang: '秉忠贞之志，守谦退之节。',
                },
                {
                    url: 'generals/xunyu/jieming2',
                    lang: '我，永不背弃。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.caopi', {
    title: '霸业的继承者',
    rs: '甄姬 崔琰毛玠',
    death_audio: '子建，子建……',
    skills: {
        ['wars.caopi.xingshang']: {
            name: '行殇',
            desc: '当其他角色死亡时，你可以获得其所有的牌。',
            desc2: '当其他角色死亡时，你可获得其所有牌。',
            audios: [
                {
                    url: 'generals/caopi/xingshang1',
                    lang: '来，管杀还管埋！',
                },
                {
                    url: 'generals/caopi/xingshang2',
                    lang: '我的是我的，你的，还是我的！',
                },
            ],
        },
        ['wars.caopi.fangzhu']: {
            name: '放逐',
            desc: '当你受到伤害后，你可以令一名其他角色摸X张牌并将武将牌叠置（X为你已损失的体力值）。',
            desc2: '当你受到伤害后，你可令一名其他角色摸X张牌（X为你已损失的体力值）▶其叠置。',
            audios: [
                {
                    url: 'generals/caopi/fangzhu1',
                    lang: '给我翻过来！',
                },
                {
                    url: 'generals/caopi/fangzhu2',
                    lang: '死罪可免，活罪难赦！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.yuejin', {
    title: '奋强突固',
    rs: '李典',
    death_audio: '箭疮发作，吾命休矣……',
    skills: {
        ['wars.yuejin.xiaoguo']: {
            name: '骁果',
            desc: '其他角色的结束阶段，你可以弃置一张基本牌，然后除非该角色弃置一张装备牌且你摸一张牌，否则受到你造成的1点伤害。',
            desc2: '其他角色的结束阶段开始时，若其存活，你可弃置一张基本牌▶其选择：1.弃置一张装备牌▷你摸一张牌；2.受到你造成的1点普通伤害。',
            audios: [
                {
                    url: 'generals/yuejin/xiaoguo1',
                    lang: '三军听我号令，不得撤退！',
                },
                {
                    url: 'generals/yuejin/xiaoguo2',
                    lang: '看我先登城头，立下首功！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.liubei', {
    title: '乱世的枭雄',
    rs: '关羽 张飞 甘夫人 法正',
    death_audio: '汉室未兴，祖宗未耀，朕实不忍此时西去……',
    skills: {
        ['wars.liubei.rende']: {
            name: '仁德',
            desc: '出牌阶段每名角色限一次，你可以将任意张手牌交给一名其他角色，当你以此法给出第二张牌时，你可以视为使用一张基本牌。',
            desc2: '出牌阶段，你可将至少一张手牌交给一名角色▶你于此阶段内不能再次对这些角色发动此技能。若你于此阶段内因执行此技能的消耗而交给其他角色的手牌数大于1且于此次发动此技能之前于此阶段内因执行此技能的消耗而交给其他角色的手牌数小于2，你可使用无对应的实体牌的基本牌。\n' +
                '◆若你因执行〖仁德〗的效果而使用【杀】，你须声明是使用哪种【杀】，且你因使用此【杀】而进行的合法性检测的规则中，由此牌的牌面信息中的"使用目标"产生的规则改为"你的攻击范围内的其他角色"且此【杀】计入限制的次数。',
            audios: [
                {
                    url: 'generals/liubei/rende1',
                    lang: '施仁布泽，乃我大汉立国之本！',
                },
                {
                    url: 'generals/liubei/rende2',
                    lang: '同心同德，救困扶危！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.guanyu', {
    title: '美髯公',
    rs: '刘备 张飞',
    death_audio: '什么？此地名叫麦城？',
    skills: {
        ['wars.guanyu.wusheng']: {
            name: '武圣',
            desc: '你可以将一张红色牌当【杀】使用或打出。',
            desc2: '当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张红色牌的普【杀】。',
            audios: [
                {
                    url: 'generals/guanyu/wusheng1',
                    lang: '关羽在此，尔等受死！',
                },
                {
                    url: 'generals/guanyu/wusheng2',
                    lang: '看尔乃插标卖首！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhangfei', {
    title: '万夫不当',
    rs: '刘备 关羽',
    death_audio: '实在是杀不动了……',
    skills: {
        ['wars.zhangfei.paoxiao']: {
            name: '咆哮',
            desc: '锁定技，你使用【杀】无次数限制；\n你在一回合内使用第二张【杀】时，摸一张牌。',
            desc2: '①锁定技，你使用【杀】无次数的限制。②当【杀】被使用时，若使用者为你且你于此回合内使用过两张【杀】，你摸一张牌。',
            audios: [
                {
                    url: 'generals/zhangfei/paoxiao1',
                    lang: '啊~~~',
                },
                {
                    url: 'generals/zhangfei/paoxiao2',
                    lang: '燕人张飞在此！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhugeliang', {
    title: '迟暮的丞相',
    rs: '黄月英 蒋琬费祎 姜维',
    death_audio: '将星陨落，天命难违……',
    skills: {
        ['wars.zhugeliang.guanxing']: {
            name: '观星',
            desc: '准备阶段，你可以观看牌堆顶的X张牌（X为全场角色数且最多为5），然后将这些牌以任意顺序放置于牌堆顶或牌堆底。',
            desc2: '准备阶段开始时，你可将牌堆顶的X张牌（X=min{角色数,5}）扣置入处理区（对你可见）▶你将其中任意数量的牌置于牌堆顶，将其余的牌置于牌堆底。',
            audios: [
                {
                    url: 'generals/zhugeliang/guanxing1',
                    lang: '观今夜天象，知天下大事。',
                },
                {
                    url: 'generals/zhugeliang/guanxing2',
                    lang: '知天易，逆天难。',
                },
            ],
        },
        ['wars.zhugeliang.kongcheng']: {
            name: '空城',
            desc: '锁定技，若你没有手牌：\n1.当你成为【杀】或【决斗】的目标时，取消之；\n2.你的回合外，其他角色交给你的牌置于你的武将牌上，称为"琴"。\n摸牌阶段，你获得"琴"。',
            desc2: '①锁定技，当你成为【杀】或【决斗】的目标时，若你没有手牌，你取消此目标。②锁定技，当牌于你的回合外因交给而移至你的手牌区前❷，若你没有手牌，你将此次移动的目标区域改为你的武将牌上（称为"琴"）。③锁定技，摸牌阶段开始时❷，你获得所有"琴"。',
            audios: [
                {
                    url: 'generals/zhugeliang/kongcheng1',
                    lang: '（抚琴声）',
                },
                {
                    url: 'generals/zhugeliang/kongcheng2',
                    lang: '（抚琴声）',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhaoyun', {
    title: '虎威将军',
    rs: '刘禅',
    death_audio: '这，就是失败的滋味吗？',
    skills: {
        ['wars.zhaoyun.longdan']: {
            name: '龙胆',
            desc: '你可以将【杀】当【闪】、【闪】当【杀】使用或打出。\n发动"龙胆"时，若你的【杀】被【闪】抵消，则你可以对另一名角色造成1点伤害；若你的【闪】抵消了【杀】，则你可以令一名其他角色回复1点体力(不能是【杀】的使用者)。',
            desc2: '①当你需要使用/打出普【杀】时❸，你可使用/打出对应的实体牌为你的一张【闪】的普【杀】。②当你需要使用/打出【闪】时❸，你可使用/打出对应的实体牌为你的一张【杀】的【闪】。③当【杀】被一名角色使用的【闪】抵消后，若此【杀】/【闪】是你通过发动〖龙胆①〗/〖龙胆②〗来使用的，你可对另一名角色造成1点普通伤害/令另一名不为此【杀】的使用者的角色回复1点体力。',
            audios: [
                {
                    url: 'generals/zhaoyun/longdan1',
                    lang: '能进能退，乃真正法器！',
                },
                {
                    url: 'generals/zhaoyun/longdan2',
                    lang: '吾乃常山赵子龙也！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.machao', {
    title: '一骑当千',
    rs: '马岱',
    death_audio: '请将我葬在西凉……',
    skills: {
        ['wars.machao.mashu']: {
            name: '马术',
            desc: '锁定技，你计算与其他角色的距离-1。',
            desc2: '锁定技，你至其他角色的距离-1。',
            audios: [
                {
                    url: 'generals/machao/mashu1',
                    lang: '',
                },
                {
                    url: 'generals/machao/mashu2',
                    lang: '',
                },
            ],
        },
        ['wars.machao.tieqi']: {
            name: '铁骑',
            desc: '当你使用【杀】指定一个目标后，你可以进行判定，然后令其本回合一张明置的武将牌的非锁定技失效。除非该角色弃置与结果花色相同的一张牌，否则不能使用【闪】。',
            desc2: '当【杀】指定目标后，若使用者为你，你可判定▶你选择此目标对应的角色的一张处于明置状态的武将牌。此牌的所有未带有"锁定技"标签的武将技能于当前回合内无效。其选择：1.弃置与结果花色相同的一张牌；2.令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。',
            audios: [
                {
                    url: 'generals/machao/tieqi1',
                    lang: '敌人阵型已乱，随我杀~~~',
                },
                {
                    url: 'generals/machao/tieqi2',
                    lang: '目标敌阵，全军突击！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.huangyueying', {
    title: '归隐的杰女',
    rs: '诸葛亮 卧龙·诸葛亮',
    death_audio: '亮……',
    skills: {
        ['wars.huangyueying.jizhi']: {
            name: '集智',
            desc: '当你使用一张非转化的普通锦囊牌时，你可以摸一张牌。',
            desc2: '当非转化的普通锦囊牌被使用时，若使用者为你，你可摸一张牌。',
            audios: [
                {
                    url: 'generals/huangyueying/jizhi1',
                    lang: '哼哼~',
                },
                {
                    url: 'generals/huangyueying/jizhi2',
                    lang: '哼。',
                },
            ],
        },
        ['wars.huangyueying.qicai']: {
            name: '奇才',
            desc: '锁定技，你使用锦囊牌无距离限制。',
            desc2: '锁定技，你使用锦囊牌无距离关系的限制。',
            audios: [
                {
                    url: 'generals/huangyueying/qicai1',
                    lang: '',
                },
                {
                    url: 'generals/huangyueying/qicai2',
                    lang: '',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.huangzhong', {
    title: '老当益壮',
    rs: '魏延',
    death_audio: '不得不服老了……',
    skills: {
        ['wars.huangzhong.liegong']: {
            name: '烈弓',
            desc: '当你于出牌阶段内使用【杀】指定一个目标后，若该角色的手牌数不小于你的体力值或不大于你的攻击范围，则你可以令其不能使用【闪】响应此【杀】。',
            desc2: '当【杀】于出牌阶段内指定目标后，若此目标对应的角色的手牌数不小于你的体力值或不大于你的攻击范围，且使用者为你，你可令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。',
            audios: [
                {
                    url: 'generals/huangzhong/liegong1',
                    lang: '百步穿杨！',
                },
                {
                    url: 'generals/huangzhong/liegong2',
                    lang: '中！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.v2025.huangzhong', {
    title: '老当益壮',
    version: '2025移动版修订',
    rs: '魏延',
    death_audio: '不得不服老了……',
    image_url: 'generals/huangzhong/image',
    skills: {
        ['wars.v2025.huangzhong.liegong']: {
            name: '烈弓',
            desc: '当你于出牌阶段内使用【杀】指定一个目标后，若该角色的手牌数：大于等于你的体力值，或小于等于你的攻击范围，你可以令其不能使用【闪】响应此【杀】。若两个条件均满足，此【杀】伤害+1。',
            desc2: '当【杀】于出牌阶段内指定目标后，若此目标对应的角色的手牌数不小于你的体力值或不大于你的攻击范围，且使用者为你，你可令此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标。若两个条件均满足，此【杀】伤害+1。',
            audios: [
                {
                    url: 'generals/huangzhong/liegong1',
                    lang: '百步穿杨！',
                },
                {
                    url: 'generals/huangzhong/liegong2',
                    lang: '中！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.weiyan', {
    title: '嗜血的独狼',
    rs: '黄忠',
    death_audio: '奸贼……害我……',
    skills: {
        ['wars.weiyan.kuanggu']: {
            name: '狂骨',
            desc: '当你对距离1以内的一名角色造成伤害后，你可以回复1点体力或摸一张牌。',
            desc2: '当你对一名角色造成伤害后，若你至其的距离于其因受到此伤害而扣减体力前小于2，你可选择：1.回复1点体力；2.摸一张牌。',
            audios: [
                {
                    url: 'generals/weiyan/kuanggu1',
                    lang: '哈哈哈哈哈哈，赢你还不容易！',
                },
                {
                    url: 'generals/weiyan/kuanggu2',
                    lang: '哼！也不看看我是何人！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.pangtong', {
    title: '凤雏',
    rs: '卧龙·诸葛亮',
    death_audio: '看来，我命中注定将丧命于此。',
    skills: {
        ['wars.pangtong.lianhuan']: {
            name: '连环',
            desc: '你可以将一张梅花手牌当【铁索连环】使用或重铸。',
            desc2: '①当你需要使用【铁索连环】时❸，你可使用对应的实体牌为你的一张梅花手牌的【铁索连环】。②出牌阶段，你可重铸你的一张梅花手牌。',
            audios: [
                {
                    url: 'generals/pangtong/lianhuan1',
                    lang: '伤一敌可连其百。',
                },
                {
                    url: 'generals/pangtong/lianhuan2',
                    lang: '统统连起来吧。',
                },
            ],
        },
        ['wars.pangtong.niepan']: {
            name: '涅槃',
            desc: '限定技，当你处于濒死状态时，你可以弃置所有牌，然后复原你的武将牌，摸三张牌，将体力回复至3点。',
            desc2: '限定技，当你处于濒死状态时，你可获得1枚"涅"▶你弃置你的区域里的所有牌，复原，摸三张牌，将体力回复至3点。',
            audios: [
                {
                    url: 'generals/pangtong/niepan1',
                    lang: '凤雏岂能消亡？',
                },
                {
                    url: 'generals/pangtong/niepan2',
                    lang: '浴火重生！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.wolong', {
    title: '卧龙',
    rs: '黄月英 庞统',
    death_audio: '我的计谋竟被……',
    skills: {
        ['wars.wolong.bazhen']: {
            name: '八阵',
            desc: '锁定技，若你的装备区里没有防具牌，你视为装备着【八卦阵】。',
            desc2: '锁定技，若你的防具区不处于封印状态且你的防具区里没有牌，你视为装备着【八卦阵】。',
            audios: [
                {
                    url: 'generals/wolong/bazhen1',
                    lang: '你可识得此阵？',
                },
                {
                    url: 'generals/wolong/bazhen2',
                    lang: '太极生两仪，两仪生四象，四象生八卦。',
                },
            ],
        },
        ['wars.wolong.huoji']: {
            name: '火计',
            desc: '你可以将一张红色手牌当【火攻】使用。',
            desc2: '当你需要使用【火攻】时❸，你可使用对应的实体牌为你的一张红色手牌的【火攻】。',
            audios: [
                {
                    url: 'generals/wolong/huoji1',
                    lang: '此火可助我军大获全胜。',
                },
                {
                    url: 'generals/wolong/huoji2',
                    lang: '燃烧吧。',
                },
            ],
        },
        ['wars.wolong.kanpo']: {
            name: '看破',
            desc: '你可以将一张黑色手牌当【无懈可击】使用。',
            desc2: '当你需要使用普【无懈可击】时❸，你可使用对应的实体牌为你的一张黑色手牌的普【无懈可击】。',
            audios: [
                {
                    url: 'generals/wolong/kanpo1',
                    lang: '雕虫小技。',
                },
                {
                    url: 'generals/wolong/kanpo2',
                    lang: '你的计谋被识破啦。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.liushan', {
    title: '无为的真命主',
    rs: '赵云',
    death_audio: '别打脸，我投降还不行吗？',
    skills: {
        ['wars.liushan.xiangle']: {
            name: '享乐',
            desc: '锁定技，当你成为一名角色使用【杀】的目标后，除非该角色弃置一张基本牌，否则此【杀】对你无效。',
            desc2: '锁定技，当你成为【杀】的目标后，你令使用者选择：1.弃置一张基本牌；2.此【杀】对此目标无效。',
            audios: [
                {
                    url: 'generals/liushan/xiangle1',
                    lang: '嗯，打打杀杀，真没意思。',
                },
                {
                    url: 'generals/liushan/xiangle2',
                    lang: '我爸爸是刘备！',
                },
            ],
        },
        ['wars.liushan.fangquan']: {
            name: '放权',
            desc: '你可以跳过出牌阶段，然后此回合结束时，你可以弃置一张手牌并令一名其他角色获得一个额外的回合。',
            desc2: '出牌阶段开始前，你可跳过此阶段▶（→）此回合结束前❶，你可弃置一张手牌并选择一名其他角色▷其获得一个额外回合。',
            audios: [
                {
                    url: 'generals/liushan/fangquan1',
                    lang: '这可如何是好啊？',
                },
                {
                    url: 'generals/liushan/fangquan2',
                    lang: '嘿，你办事，我放心。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.menghuo', {
    title: '南蛮王',
    rs: '祝融',
    death_audio: '七纵之恩，来世再报了。',
    skills: {
        ['wars.menghuo.huoshou']: {
            name: '祸首',
            desc: '锁定技，【南蛮入侵】对你无效；\n当其他角色使用【南蛮入侵】指定目标后，你代替其成为此牌造成的伤害的来源。',
            desc2: '①锁定技，当【南蛮入侵】对目标的使用结算开始时，若此目标对应的角色为你，你令此【南蛮入侵】对此目标无效。②锁定技，当【南蛮入侵】指定第一个目标后，若使用者不为你，你代替其成为渠道为此牌的伤害的来源。',
            audios: [
                {
                    url: 'generals/menghuo/huoshou1',
                    lang: '背黑锅我来，送死？你去！',
                },
                {
                    url: 'generals/menghuo/huoshou2',
                    lang: '统统算我的！',
                },
            ],
        },
        ['wars.menghuo.zaiqi']: {
            name: '再起',
            desc: '摸牌阶段，你可以改为亮出牌堆顶的X张牌（X为你已损失的体力值），然后回复等同于其中红桃牌数量的体力，并获得其余的牌。',
            desc2: '摸牌阶段开始时❷，若你已受伤，你可令额定摸牌数改为0▶你亮出牌堆顶的X张牌（X为你已损失的体力值），回复等同于其中红桃牌数的体力，将这些红桃牌置入弃牌堆，获得其余的牌。',
            audios: [
                {
                    url: 'generals/menghuo/zaiqi1',
                    lang: '丞相助我！！',
                },
                {
                    url: 'generals/menghuo/zaiqi2',
                    lang: '起！！！！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhurong', {
    title: '野性的女王',
    rs: '孟获',
    death_audio: '七纵之恩，来世再报了。',
    skills: {
        ['wars.zhurong.juxiang']: {
            name: '巨象',
            desc: '锁定技，【南蛮入侵】对你无效；\n当其他角色使用的【南蛮入侵】结算结束后，你获得之。',
            desc2: '①锁定技，当【南蛮入侵】对目标的使用结算开始时，若此目标对应的角色为你，你令此【南蛮入侵】对此目标无效。②锁定技，当【南蛮入侵】使用结算结束后❸，若使用者不为你，你获得此【南蛮入侵】对应的所有实体牌。',
            audios: [
                {
                    url: 'generals/zhurong/juxiang1',
                    lang: '大王，看我的！',
                },
                {
                    url: 'generals/zhurong/juxiang2',
                    lang: '小小把戏。',
                },
            ],
        },
        ['wars.zhurong.lieren']: {
            name: '烈刃',
            desc: '当你使用【杀】对目标角色造成伤害后，你可以与其拼点：\n若你赢，你获得其一张牌。',
            desc2: '当你因执行你使用的【杀】的效果而对一名角色造成伤害后，你可与其拼点▶若你赢，你获得其一张牌。',
            audios: [
                {
                    url: 'generals/zhurong/lieren1',
                    lang: '尝尝我飞刀的厉害！！',
                },
                {
                    url: 'generals/zhurong/lieren2',
                    lang: '亮兵器吧。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.ganfuren', {
    title: '昭烈皇后',
    rs: '刘备',
    death_audio: '请替我照顾好阿斗。',
    skills: {
        ['wars.ganfuren.shushen']: {
            name: '淑慎',
            desc: '当你回复1点体力后，你可以令一名其他角色摸一张牌。',
            desc2: '当你回复1点体力后，你可令一名其他角色摸一张牌。',
            audios: [
                {
                    url: 'generals/ganfuren/shushen1',
                    lang: '船到桥头自然直。',
                },
                {
                    url: 'generals/ganfuren/shushen2',
                    lang: '妾身无恙，相公请安心征战。',
                },
            ],
        },
        ['wars.ganfuren.shenzhi']: {
            name: '神智',
            desc: '准备阶段，你可以弃置所有手牌，若你以此法弃置的手牌数不小于你的体力值，你回复1点体力。',
            desc2: '准备阶段开始时，你可弃置所有手牌▶若你以此法弃置的手牌数不小于你的体力值，你回复1点体力。',
            audios: [
                {
                    url: 'generals/ganfuren/shenzhi1',
                    lang: '子龙将军，一切都托付给你了。',
                },
                {
                    url: 'generals/ganfuren/shenzhi2',
                    lang: '阿斗，相信妈妈，没事的。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.sunquan', {
    title: '年轻的贤君',
    rs: '周泰',
    death_audio: '父亲，大哥，仲谋愧矣……',
    skills: {
        ['wars.sunquan.zhiheng']: {
            name: '制衡',
            desc: '出牌阶段限一次，你可以弃置至多X张牌（X为你的体力上限），然后摸等量的牌。',
            desc2: '出牌阶段限一次，你可弃置至多X张牌（X为你的体力上限）▶你摸等量的牌。',
            audios: [
                {
                    url: 'generals/sunquan/zhiheng1',
                    lang: '容我三思。',
                },
                {
                    url: 'generals/sunquan/zhiheng2',
                    lang: '且慢。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.ganning', {
    title: '锦帆游侠',
    rs: '凌统',
    death_audio: '二十年后，又是一条好汉！',
    skills: {
        ['wars.ganning.qixi']: {
            name: '奇袭',
            desc: '你可以将一张黑色牌当【过河拆桥】使用。',
            desc2: '当你需要使用【过河拆桥】时❸，你可使用对应的实体牌为你的一张黑色牌的【过河拆桥】。',
            audios: [
                {
                    url: 'generals/ganning/qixi1',
                    lang: '接招吧！',
                },
                {
                    url: 'generals/ganning/qixi2',
                    lang: '你的牌太多了！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.lvmeng', {
    title: '士别三日',
    rs: '',
    death_audio: '种下恶因，必有恶果。',
    skills: {
        ['wars.lvmeng.keji']: {
            name: '克己',
            desc: '锁定技，弃牌阶段开始时，若你未于出牌阶段内使用过颜色不同的牌或出牌阶段被跳过，你的手牌上限于此回合内+4。',
            desc2: '锁定技，弃牌阶段开始时，若你未执行过出牌阶段或于出牌阶段内未使用过颜色不同的牌，你的手牌上限于此回合内+4。',
            audios: [
                {
                    url: 'generals/lvmeng/keji1',
                    lang: '谨慎为妙。',
                },
                {
                    url: 'generals/lvmeng/keji2',
                    lang: '时机未到。',
                },
            ],
        },
        ['wars.lvmeng.mouduan']: {
            name: '谋断',
            desc: '结束阶段，若你于出牌阶段内使用过四种花色或三种类别的牌，则你可以移动场上的一张牌。',
            desc2: '结束阶段开始时，若你于出牌阶段内使用过四种花色或三种类别的牌，你可将一名角色的判定/装备区里的一张牌置入另一名角色的判定/装备区。',
            audios: [
                {
                    url: 'generals/lvmeng/mouduan1',
                    lang: '今日起兵，渡江攻敌！',
                },
                {
                    url: 'generals/lvmeng/mouduan2',
                    lang: '时机已到，全军出击！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.huanggai', {
    title: '轻身为国',
    rs: '周瑜',
    death_audio: '盖，有负公瑾重托……',
    skills: {
        ['wars.huanggai.kurou']: {
            name: '苦肉',
            desc: '出牌阶段限一次，你可以弃一张牌，然后你失去1点体力并摸三张牌，本回合你可以多使用一张【杀】。',
            desc2: '出牌阶段限一次，你可弃置一张牌▶你失去1点体力，摸三张牌。你使用【杀】的次数上限于此阶段内+1。',
            audios: [
                {
                    url: 'generals/huanggai/kurou1',
                    lang: '我这把老骨头不算什么。',
                },
                {
                    url: 'generals/huanggai/kurou2',
                    lang: '为成大义，死不足惜！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhouyu', {
    title: '大都督',
    rs: '小乔 孙策 黄盖',
    death_audio: '既生瑜，何生亮。既生瑜，何生亮！',
    skills: {
        ['wars.zhouyu.yingzi']: {
            name: '英姿',
            desc: '锁定技，摸牌阶段，你多摸一张牌；\n你的手牌上限与你的体力上限相等。',
            desc2: '①锁定技，摸牌阶段，你令额定摸牌数+1。②锁定技，你的手牌上限为X（X为你的体力上限）。',
            audios: [
                {
                    url: 'generals/zhouyu/yingzi1',
                    lang: '伯符，且看我这一手！',
                },
                {
                    url: 'generals/zhouyu/yingzi2',
                    lang: '哈哈哈哈哈哈哈哈！',
                },
            ],
        },
        ['wars.zhouyu.fanjian']: {
            name: '反间',
            desc: '出牌阶段限一次，你可以展示一张手牌并交给一名其他角色，其选择一项：\n1.展示所有手牌，弃置与此牌同花色的牌；\n2.失去1点体力。',
            desc2: '出牌阶段限一次，你可展示一张手牌▶你将此牌交给一名角色。其选择：1.展示所有手牌，弃置与你以此法展示的牌花色相同的所有牌；2.失去1点体力。',
            audios: [
                {
                    url: 'generals/zhouyu/fanjian1',
                    lang: '抉择吧，在这苦与痛的地狱中！',
                },
                {
                    url: 'generals/zhouyu/fanjian2',
                    lang: '与我为敌，就当这般生不如死！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.daqiao', {
    title: '矜持之花',
    rs: '孙策 小乔',
    death_audio: '伯符，我去了……',
    skills: {
        ['wars.daqiao.guose']: {
            name: '国色',
            desc: '你可以将一张方块牌当【乐不思蜀】使用。',
            desc2: '当你需要使用【乐不思蜀】时❸，你可使用对应的实体牌为你的一张方块牌的【乐不思蜀】。',
            audios: [
                {
                    url: 'generals/daqiao/guose1',
                    lang: '请休息吧。',
                },
                {
                    url: 'generals/daqiao/guose2',
                    lang: '你累了。',
                },
            ],
        },
        ['wars.daqiao.liuli']: {
            name: '流离',
            desc: '当你成为【杀】的目标时，你可以弃置一张牌并将此【杀】转移给你攻击范围内的一名其他角色。',
            desc2: '当你成为【杀】的目标时，你可弃置一张牌并选择你的攻击范围内的一名是此【杀】的合法目标且与此牌的目标列表中的所有目标均无对应关系的角色（距离关系限制规则对此次合法性检测不产生影响）▶此【杀】转移给该角色。',
            audios: [
                {
                    url: 'generals/daqiao/liuli1',
                    lang: '交给你了。',
                },
                {
                    url: 'generals/daqiao/liuli2',
                    lang: '你来嘛~',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.luxun', {
    title: '擎天之柱',
    rs: '陆抗',
    death_audio: '还以为我已经不再年轻……',
    skills: {
        ['wars.luxun.qianxun']: {
            name: '谦逊',
            desc: '锁定技，当你成为【顺手牵羊】或【乐不思蜀】的目标时，则取消之。',
            desc2: '①锁定技，当你成为【顺手牵羊】的目标时，你取消此目标。②锁定技，当【乐不思蜀】对应的实体牌移至你的判定区前❷，你将此牌置入弃牌堆。',
            audios: [
                {
                    url: 'generals/luxun/qianxun1',
                    lang: '儒生脱尘，不为贪逸淫乐之事。',
                },
                {
                    url: 'generals/luxun/qianxun2',
                    lang: '谦谦君子，不饮盗泉之水。',
                },
            ],
        },
        ['wars.luxun.duoshi']: {
            name: '度势',
            desc: '出牌阶段限四次，你可以将一张红色手牌当【以逸待劳】使用。',
            desc2: '当你需要使用【以逸待劳】时❸，若你于当前阶段内发动过此技能的次数小于4，你可使用对应的实体牌为你的一张红色手牌的【以逸待劳】。',
            audios: [
                {
                    url: 'generals/luxun/duoshi1',
                    lang: '以今日之大势当行此计。',
                },
                {
                    url: 'generals/luxun/duoshi2',
                    lang: '国之大计审视为先。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.v2025.luxun', {
    version: '2025移动版修订',
    title: '擎天之柱',
    image_url: 'generals/luxun/image',
    rs: '陆抗',
    death_audio: '还以为我已经不再年轻……',
    skills: {
        ['wars.v2025.luxun.qianxun']: {
            name: '谦逊',
            desc: '锁定技，当你成为其他角色使用的锦囊牌的唯一目标时，若你武将牌上的"节"数小于3，你取消之并将此牌置于你的武将牌上，称为"节"。',
            desc2: '',
            audios: [
                {
                    url: 'generals/luxun/qianxun1',
                    lang: '儒生脱尘，不为贪逸淫乐之事。',
                },
                {
                    url: 'generals/luxun/qianxun2',
                    lang: '谦谦君子，不饮盗泉之水。',
                },
            ],
        },
        ['wars.v2025.luxun.duoshi']: {
            name: '度势',
            desc: '出牌阶段限一次，你可以选择一项：\n1.将一张红色手牌当【以逸待劳】使用；\n2.将场上三张"节"置入弃牌堆，视为使用一张造成火焰伤害的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/luxun/duoshi1',
                    lang: '以今日之大势当行此计。',
                },
                {
                    url: 'generals/luxun/duoshi2',
                    lang: '国之大计审视为先。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.sunshangxiang', {
    title: '弓腰姬',
    rs: '',
    death_audio: '不！还不可以死……',
    skills: {
        ['wars.sunshangxiang.jieyin']: {
            name: '结姻',
            desc: '出牌阶段限一次，你可以弃置两张手牌，令你和一名已受伤的男性角色各回复1点体力。',
            desc2: '出牌阶段限一次，你可弃置两张手牌并选择一名已受伤的其他男性角色▶你与其各回复1点体力。',
            audios: [
                {
                    url: 'generals/sunshangxiang/jieyin1',
                    lang: '夫君，身体要紧。',
                },
                {
                    url: 'generals/sunshangxiang/jieyin2',
                    lang: '他好，我也好。',
                },
            ],
        },
        ['wars.sunshangxiang.xiaoji']: {
            name: '枭姬',
            desc: '当你失去装备区里的牌后，你可以摸两张牌。',
            desc2: '当你失去装备区里的牌后❷，你可摸两张牌。',
            audios: [
                {
                    url: 'generals/sunshangxiang/xiaoji1',
                    lang: '哼！',
                },
                {
                    url: 'generals/sunshangxiang/xiaoji2',
                    lang: '看我的厉害！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.sunjian', {
    title: '武烈帝',
    rs: '吴国太',
    death_audio: '有埋伏！呃……啊！！',
    skills: {
        ['wars.sunjian.yinghun']: {
            name: '英魂',
            desc: '准备阶段，若你已受伤，你可以选择一名其他角色并选择一项：\n1.令其摸X张牌，然后弃置一张牌；\n2.令其摸一张牌，然后弃置X张牌。（X为你已损失的体力值）',
            desc2: '准备阶段开始时，若你已受伤，你可选择：1.{令一名其他角色获得1枚"魂"▶其摸X张牌，弃置一张牌}；2.{令一名其他角色获得1枚"魂"▶其摸一张牌，弃置X张牌}。（X为你已损失的体力值）',
            audios: [
                {
                    url: 'generals/sunjian/yinghun1',
                    lang: '以吾魂魄，保佑吾儿之基业。',
                },
                {
                    url: 'generals/sunjian/yinghun2',
                    lang: '不诛此贼三族，则吾死不瞑目！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.xiaoqiao', {
    title: '矫情之花',
    rs: '周瑜 大乔',
    death_audio: '公瑾，我先走一步……',
    skills: {
        ['wars.xiaoqiao.tianxiang']: {
            name: '天香',
            desc: '当你受到伤害时，你可以弃置一张红桃手牌，防止此次伤害并选择一名其他角色，你选择一项：\n1..令其受到伤害来源对其造成的1点伤害，然后摸X张牌(X为其已损失体力值且至多为5)；\n2.令其失去1点体力，然后其获得你弃置的牌。',
            desc2: '当你受到伤害时❸，你可弃置一张红桃手牌并选择一名其他角色▶你防止此伤害，选择：1.令来源对其造成1点普通伤害▷其摸X张牌（X=min{其已损失的体力值,5}）；2.令其失去1点体力▷若牌堆/弃牌堆里有你以此法弃置的牌，其获得牌堆/弃牌堆里的你以此法弃置的牌\n' +
                '◆一张牌是你以此法弃置的牌的这个信息不会因任何原因而被清除。',
            audios: [
                {
                    url: 'generals/xiaoqiao/tianxiang1',
                    lang: '接着哦~',
                },
                {
                    url: 'generals/xiaoqiao/tianxiang2',
                    lang: '替我挡着。',
                },
            ],
        },
        ['wars.xiaoqiao.hongyan']: {
            name: '红颜',
            desc: '锁定技，你的黑桃牌均视为红桃牌。',
            desc2: '锁定技，你的黑桃牌或你的黑桃判定牌的花色视为红桃。',
            audios: [
                {
                    url: 'generals/xiaoqiao/hongyan1',
                    lang: '',
                },
                {
                    url: 'generals/xiaoqiao/hongyan2',
                    lang: '',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.taishici', {
    title: '笃烈之士',
    rs: '孙策',
    death_audio: '大丈夫当带三尺之剑，立不世之功……',
    skills: {
        ['wars.taishici.tianyi']: {
            name: '天义',
            desc: '出牌阶段限一次，你可以与一名角色拼点：\n若你赢，本回合你可以多使用一张【杀】、使用【杀】无距离限制且可以多选择一个目标；\n若你没赢，本回合你不能使用【杀】。',
            desc2: '出牌阶段限一次，你可与一名角色拼点▶若你：赢，你于此阶段内{使用【杀】的次数上限和额定目标数上限均+1且使用【杀】无距离关系的限制}；未赢，你于此阶段内不能使用【杀】。',
            audios: [
                {
                    url: 'generals/taishici/tianyi1',
                    lang: '我当要替天行道。',
                },
                {
                    url: 'generals/taishici/tianyi2',
                    lang: '请助我一臂之力！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhoutai', {
    title: '历战之躯',
    rs: '孙权 蒋钦',
    death_audio: '敌众我寡，无力回天……',
    skills: {
        ['wars.zhoutai.buqu']: {
            name: '不屈',
            desc: '锁定技，当你处于濒死状态时，你将牌堆顶的一张牌置于你的武将牌上，称为"创"；\n若此牌点数与已有的"创"点数均不同，你将体力回复至1点；\n若点数相同，将此牌置入弃牌堆。',
            desc2: '锁定技，当你处于濒死状态时，你将牌堆顶的一张牌置于武将牌上（称为"创"）▶若：没有与此"创"点数相同的其他"创"，你将体力回复至1点；有与此"创"点数相同的其他"创"，你将此"创"置入弃牌堆。',
            audios: [
                {
                    url: 'generals/zhoutai/buqu1',
                    lang: '战如熊虎，不惜躯命！',
                },
                {
                    url: 'generals/zhoutai/buqu2',
                    lang: '哼，这点小伤算什么！',
                },
            ],
        },
        ['wars.zhoutai.fenji']: {
            name: '奋激',
            desc: '一名角色的结束阶段，若其没有手牌，你可令其摸两张牌，然后你失去1点体力。',
            desc2: '一名角色的结束阶段开始时，若其没有手牌，你可令其摸两张牌▶你失去1点体力。',
            audios: [
                {
                    url: 'generals/zhoutai/fenji1',
                    lang: '百战之身，奋勇趋前！',
                },
                {
                    url: 'generals/zhoutai/fenji2',
                    lang: '两肋插刀，愿付此躯！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.lusu', {
    title: '独断的外交家',
    death_audio: '此联盟已破，吴蜀休矣……',
    skills: {
        ['wars.lusu.haoshi']: {
            name: '好施',
            desc: '摸牌阶段，你可以多摸两张牌，然后若你的手牌数大于5，则你将一半（向下取整）的手牌交给手牌最少的一名其他角色。',
            desc2: '摸牌阶段，你可令额定摸牌数+2▶（→）摸牌阶段结束时，若你的手牌数大于5，你将一半的手牌交给除你外手牌数最小的一名角色。',
            audios: [
                {
                    url: 'generals/lusu/haoshi1',
                    lang: '拿去拿去，莫跟哥哥客气。',
                },
                {
                    url: 'generals/lusu/haoshi2',
                    lang: '来来来，见面分一半。',
                },
            ],
        },
        ['wars.lusu.dimeng']: {
            name: '缔盟',
            desc: '出牌阶段限一次，你可以选择两名其他角色并弃置X张牌（X为这两名角色手牌数的差），然后令这两名角色交换手牌。',
            desc2: '①出牌阶段限一次，你可令两名均有手牌且手牌数相等的其他角色交换手牌▶〖缔盟②〗于此阶段内无效。②出牌阶段限一次，你可选择两名手牌数不等的其他角色并弃置X张牌（X为这两名角色的手牌数之差）▶这两名角色交换手牌。〖缔盟①〗于此阶段内无效。',
            audios: [
                {
                    url: 'generals/lusu/dimeng1',
                    lang: '以和为贵，以和为贵。',
                },
                {
                    url: 'generals/lusu/dimeng2',
                    lang: '合纵连横，方能以弱胜强。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhangzhaozhanghong', {
    title: '经天纬地',
    rs: '',
    death_audio: '竭力尽智，死而无憾……',
    image_self_url: 'generals/zhangzhaozhanghong/image',
    skills: {
        ['wars.zhangzhaozhanghong.zhijian']: {
            name: '直谏',
            desc: '出牌阶段，你可以将手牌中的一张装备牌置于其他角色的装备区里，然后摸一张牌。',
            desc2: '出牌阶段，你可将手牌区里的一张装备牌置入一名其他角色的装备区▶你摸一张牌。',
            audios: [
                {
                    url: 'generals/zhangzhaozhanghong/zhijian1',
                    lang: '请恕老臣直言。',
                },
                {
                    url: 'generals/zhangzhaozhanghong/zhijian2',
                    lang: '为臣者，当冒死以谏！',
                },
            ],
        },
        ['wars.zhangzhaozhanghong.guzheng']: {
            name: '固政',
            desc: '其他角色的弃牌阶段结束时，你可以将此阶段中的一张弃牌返还给该角色，然后你获得其余的弃牌。',
            desc2: '其他角色的弃牌阶段结束时，你可将弃牌堆里的一张曾是其于此阶段内弃置过的其手牌的牌交给该角色▶你可获得弃牌堆里的所有曾是于此阶段内因弃置而移至弃牌堆的牌的牌。',
            audios: [
                {
                    url: 'generals/zhangzhaozhanghong/guzheng1',
                    lang: '今当稳固内政，以御外患！',
                },
                {
                    url: 'generals/zhangzhaozhanghong/guzheng2',
                    lang: '固国安邦，须当如是！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.dingfeng', {
    title: '清侧重臣',
    rs: '徐盛',
    death_audio: '这风，太冷了……',
    skills: {
        ['wars.dingfeng.duanbing']: {
            name: '短兵',
            desc: '你使用【杀】可以多选择一名距离为1的角色为目标。',
            desc2: '当【杀】选择目标后，若使用者为你，你可令一名距离为1的角色也成为此【杀】的目标。',
            audios: [
                {
                    url: 'generals/dingfeng/duanbing1',
                    lang: '众将官，短刀出鞘。',
                },
                {
                    url: 'generals/dingfeng/duanbing2',
                    lang: '短兵轻甲也可取汝性命！',
                },
            ],
        },
        ['wars.dingfeng.fenxun']: {
            name: '奋迅',
            desc: '出牌阶段限一次，你可以弃置一张牌并选择一名其他角色，然后本回合你计算与其的距离视为1。',
            desc2: '出牌阶段限一次，你可弃置一张牌并选择一名其他角色▶你至其的距离于此回合内视为1。',
            audios: [
                {
                    url: 'generals/dingfeng/fenxun1',
                    lang: '取封侯爵赏，正在今日！',
                },
                {
                    url: 'generals/dingfeng/fenxun2',
                    lang: '给我拉过来！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.huatuo', {
    title: '神医',
    rs: '',
    death_audio: '生老病死，命不可违……',
    skills: {
        ['wars.huatuo.jijiu']: {
            name: '急救',
            desc: '你的回合外，你可以将一张红色牌当【桃】使用。',
            desc2: '当你于回合外需要使用【桃】时❸，你可使用对应的实体牌为你的一张红色牌的【桃】。',
            audios: [
                {
                    url: 'generals/huatuo/jijiu1',
                    lang: '救死扶伤，悬壶济世。',
                },
                {
                    url: 'generals/huatuo/jijiu2',
                    lang: '妙手仁心，药到病除！',
                },
            ],
        },
        ['wars.huatuo.chuli']: {
            name: '除疬',
            desc: '出牌阶段限一次，你可以选择至多三名势力各不相同或未确定势力的角色，然后你弃置你和这些角色的各一张牌，因此失去黑桃牌的角色各摸一张牌。',
            desc2: '出牌阶段限一次，若你有能弃置的牌，你可获得1枚"疠"并选择不包括两名势力相同的角色在内的至多三名角色▶你弃置一张牌，弃置这些角色的各一张牌。若你的以此法被弃置的牌为黑桃，你摸一张牌。因执行发动此次〖除疬〗的效果而被你弃置的牌为黑桃的所有其他角色各摸一张牌。',
            audios: [
                {
                    url: 'generals/huatuo/chuli1',
                    lang: '病去，如抽丝。',
                },
                {
                    url: 'generals/huatuo/chuli2',
                    lang: '病入膏肓，需下猛药。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.lvbu', {
    title: '武的化身',
    rs: '貂蝉',
    death_audio: '不可能！',
    skills: {
        ['wars.lvbu.wushuang']: {
            name: '无双',
            desc: '锁定技，你使用的【杀】需两张【闪】才能抵消；\n与你进行【决斗】的角色每次需打出两张【杀】。',
            desc2: '①锁定技，当【杀】指定目标后，若使用者为你，你将此目标对应的角色抵消此【杀】的方式改为依次使用两张【闪】。②锁定技，当【决斗】指定目标后，若使用者为你，你将此【决斗】的作用效果改为{由目标对应的角色开始，其与你以"其，其，你，其，其，你……"的顺序依次打出【杀】，直到其与你中的一名角色未打出【杀】。未打出【杀】的角色受到其与你中的另一名角色造成的1点普通伤害}。③锁定技，当你成为【决斗】的目标后，若此【决斗】的作用效果：未受到过〖无双②〗的影响，你将此【决斗】的作用效果改为{由目标对应的角色开始，其与你以"其，你，你，其，你，你……"的顺序依次打出【杀】，直到其与你中的一名角色未打出【杀】。未打出【杀】的角色受到其与你中的另一名角色造成的1点普通伤害}；受到过〖无双②〗的影响，你将此【决斗】的作用效果改为{由目标对应的角色开始，其与你以"其，其，你，你，其，其，你，你……"的顺序依次打出【杀】，直到其与你中的一名角色未打出【杀】。未打出【杀】的角色受到其与你中的另一名角色造成的1点普通伤害}。',
            audios: [
                {
                    url: 'generals/lvbu/wushuang1',
                    lang: '谁能挡我！',
                },
                {
                    url: 'generals/lvbu/wushuang2',
                    lang: '神挡杀神，佛挡杀佛！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.diaochan', {
    title: '绝世的舞姬',
    rs: '吕布',
    death_audio: '父亲大人，对不起……',
    skills: {
        ['wars.diaochan.lijian']: {
            name: '离间',
            desc: '出牌阶段限一次，你可以弃置一张牌并选择两名其他男性角色，然后令其中一名男性角色视为对另一名男性角色使用一张【决斗】。',
            desc2: '出牌阶段限一次，你可弃置一张牌并选择一名能使用无对应的实体牌的【决斗】的其他男性角色A和一名是A使用无对应的实体牌的【决斗】的合法目标的其他男性角色B▶A对B使用无对应的实体牌的【决斗】。',
            audios: [
                {
                    url: 'generals/diaochan/lijian1',
                    lang: '嗯呵呵~~呵呵~~',
                },
                {
                    url: 'generals/diaochan/lijian2',
                    lang: '夫君，你要替妾身做主啊……',
                },
            ],
        },
        ['wars.diaochan.biyue']: {
            name: '闭月',
            desc: '结束阶段，你可以摸一张牌。',
            desc2: '结束阶段开始时，你可摸一张牌。',
            audios: [
                {
                    url: 'generals/diaochan/biyue1',
                    lang: '失礼了~',
                },
                {
                    url: 'generals/diaochan/biyue2',
                    lang: '羡慕吧~',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.yuanshao', {
    title: '高贵的名门',
    rs: '颜良文丑',
    death_audio: '老天不助我袁家啊！',
    skills: {
        ['wars.yuanshao.luanji']: {
            name: '乱击',
            desc: '出牌阶段，你可以将两张手牌当【万箭齐发】使用(不能使用本回合发动此技能时已用过的花色)，然后与你势力相同的角色打出【闪】后可以摸一张牌。',
            desc2: '当你需要使用【万箭齐发】时，你可使用对应的实体牌为你的与你此前于此回合内因发动此技能而选择过的所有牌的花色均不相同的两张手牌的【万箭齐发】。当因执行此【万箭齐发】的效果而打出的【闪】结算结束后，若打出者与你势力相同，其可摸一张牌。',
            audios: [
                {
                    url: 'generals/yuanshao/luanji1',
                    lang: '弓箭手，准备放箭！',
                },
                {
                    url: 'generals/yuanshao/luanji2',
                    lang: '全都去死吧！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.yanliangwenchou', {
    title: '虎狼兄弟',
    rs: '袁绍',
    death_audio: '这红脸长须大将是……',
    image_self_url: 'generals/yanliangwenchou/image',
    skills: {
        ['wars.yanliangwenchou.shuangxiong']: {
            name: '双雄',
            desc: '摸牌阶段，你可以改为进行判定，你获得生效后的判定牌，然后本回合你可以将与判定结果颜色不同的一张手牌当【决斗】使用。',
            desc2: '摸牌阶段开始时，你可令额定摸牌数改为0。你判定。当判定结果确定后，你获得判定牌。当你于此回合内需要使用【决斗】时，你可使用对应的实体牌为你的与此结果颜色不同的一张手牌。',
            audios: [
                {
                    url: 'generals/yanliangwenchou/shuangxiong1',
                    lang: '吾乃河北上将颜良（文丑）是也！',
                },
                {
                    url: 'generals/yanliangwenchou/shuangxiong2',
                    lang: '快来与我等决一死战！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.jiaxu', {
    title: '冷酷的毒士',
    rs: '张绣 李傕郭汜',
    death_audio: '我的时辰也到了……',
    skills: {
        ['wars.jiaxu.wansha']: {
            name: '完杀',
            desc: '锁定技，你的回合内，只有你和处于濒死状态的角色才能使用【桃】。',
            desc2: '锁定技，当一名角色于你的回合内进入濒死状态后，你令除其外的其他角色于此濒死结算结束之前不能使用【桃】。',
            audios: [
                {
                    url: 'generals/jiaxu/wanssha1',
                    lang: '神仙难救，神仙难救啊。',
                },
                {
                    url: 'generals/jiaxu/wanssha2',
                    lang: '我要你三更死，谁敢留你到五更！',
                },
            ],
        },
        ['wars.jiaxu.luanwu']: {
            name: '乱武',
            desc: '限定技，出牌阶段，你可以令所有其他角色依次选择一项：\n1.对距离最近的另一名角色使用一张【杀】；\n2.失去1点体力。',
            desc2: '限定技，出牌阶段，你可获得1枚"乱武"并选择所有其他角色。这些角色各需对包括距离最小的另一名角色在内的角色使用【杀】，否则失去1点体力。',
            audios: [
                {
                    url: 'generals/jiaxu/luanwu1',
                    lang: '哭喊吧，哀求吧，挣扎吧，然后，死吧！',
                },
                {
                    url: 'generals/jiaxu/luanwu2',
                    lang: '嘿嘿嘿，坐山观虎斗。',
                },
            ],
        },
        ['wars.jiaxu.weimu']: {
            name: '帷幕',
            desc: '锁定技，当你成为黑色锦囊牌的目标时，取消之。',
            desc2: '①锁定技，当你成为黑色普通锦囊牌的目标时，你取消此目标。②锁定技，当黑色延时锦囊牌对应的实体牌移至你的判定区前，你将此次移动的目标区域改为弃牌堆。',
            audios: [
                {
                    url: 'generals/jiaxu/weimu1',
                    lang: '此计伤不到我。',
                },
                {
                    url: 'generals/jiaxu/weimu2',
                    lang: '你奈我何！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.pangde', {
    title: '人马一体',
    death_audio: '我宁为国家鬼，不为贼将也……',
    skills: {
        ['wars.pangde.mashu']: {
            name: '马术',
            desc: '锁定技，你计算与其他角色的距离-1。',
            desc2: '锁定技，你至其他角色的距离-1。',
            audios: [],
        },
        ['wars.pangde.jianchu']: {
            name: '鞬出',
            desc: '当你使用【杀】指定一个目标后，你可以弃置其一张牌，\n若弃置的牌：\n是装备牌，该角色不能使用【闪】；\n不是装备牌，该角色获得此【杀】。',
            desc2: '当【杀】指定目标后，若使用者为你，你可弃置其一张牌。若以此法被弃置的牌：为装备牌，此【杀】于对此目标进行的使用结算中不是其使用【闪】的合法目标；不为装备牌，其获得此【杀】对应的所有实体牌。',
            audios: [
                {
                    url: 'generals/pangde/jianchu1',
                    lang: '来呀，冲杀出去，杀他个片甲不留。',
                },
                {
                    url: 'generals/pangde/jianchu2',
                    lang: '一人一骑，横扫千军。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhangjiao', {
    title: '天公将军',
    death_audio: '黄天…也死了……',
    skills: {
        ['wars.zhangjiao.leiji']: {
            name: '雷击',
            desc: '当你使用或打出【闪】时，你可以令一名其他角色进行判定，若结果为黑桃，你对该角色造成2点雷电伤害。',
            desc2: '当【闪】被使用/打出时，若使用/打出者为你，你可令一名其他角色判定。若结果为黑桃，你对其造成2点雷电伤害。',
            audios: [
                {
                    url: 'generals/zhangjiao/leiji1',
                    lang: '雷公助我！',
                },
                {
                    url: 'generals/zhangjiao/leiji2',
                    lang: '以我之真气，合天地之造化。',
                },
            ],
        },
        ['wars.zhangjiao.guidao']: {
            name: '鬼道',
            desc: '当一名角色的判定牌生效前，你可以打出一张黑色牌替换之。',
            desc2: '当判定结果确定前，你可打出对应的实体牌是你的一张黑色牌且与此牌牌名相同的牌。系统将此牌作为判定牌。你获得原判定牌。\n' +
                '◆你发动〖鬼道〗开始的打出流程结束之前，不会插入默认的系统将此判定牌置入弃牌堆的移动事件。',
            audios: [
                {
                    url: 'generals/zhangjiao/guidao1',
                    lang: '哼哼哼哼……',
                },
                {
                    url: 'generals/zhangjiao/guidao2',
                    lang: '天下大势，为我所控！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.caiwenji', {
    title: '异乡的孤女',
    death_audio: '人生几何时，怀忧终年岁。',
    skills: {
        ['wars.caiwenji.beige']: {
            name: '悲歌',
            desc: '当一名角色受到【杀】造成的伤害后，你可以弃置一张牌，然后令其进行判定，若结果为：\n红桃，其回复1点体力；\n方块，其摸两张牌；\n梅花，伤害来源弃置两张牌；\n黑桃，伤害来源叠置。',
            desc2: '当一名角色受到渠道为【杀】的伤害后，若其存活，你可弃置一张牌。其判定。若结果为：红桃，其回复1点体力；方块，其摸两张牌；梅花，来源弃置两张牌；黑桃，来源叠置。',
            audios: [
                {
                    url: 'generals/caiwenji/beige1',
                    lang: '制兹八拍兮拟排忧，何知曲成兮心转愁。',
                },
                {
                    url: 'generals/caiwenji/beige2',
                    lang: '悲歌可以当泣，远望可以当归。',
                },
            ],
        },
        ['wars.caiwenji.duanchang']: {
            name: '断肠',
            desc: '锁定技，当你死亡时，你令杀死你的角色失去一张武将牌的所有技能。',
            desc2: '锁定技，当你死亡时，若杀死你的角色不为你，你令其失去你选择的其一张武将牌的所有技能。',
            audios: [
                {
                    url: 'generals/caiwenji/duanchang1',
                    lang: '日东月西兮徒相忘，不得相随兮空断肠。',
                },
                {
                    url: 'generals/caiwenji/duanchang2',
                    lang: '流落异乡愁断肠。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.mateng', {
    title: '驰骋西陲',
    death_audio: '儿子，为爹报仇啊……',
    skills: {
        ['wars.mateng.mashu']: {
            name: '马术',
            desc: '锁定技，你计算与其他角色的距离-1。',
            desc2: '锁定技，你至其他角色的距离-1。',
            audios: [],
        },
        ['wars.mateng.xiongyi']: {
            name: '雄异',
            desc: '限定技，出牌阶段，你可以令与你势力相同的所有角色各摸三张牌，然后若你的势力是全场角色最少的势力，则你回复1点体力。',
            desc2: '限定技，出牌阶段，若你：有势力，{你可获得1枚"雄"并选择与你势力相同的所有角色▶这些角色各摸三张牌。若你的势力是角色数最小的势力，你回复1点体力}；没有势力，{你可获得1枚"雄"并选择若你明置后会与你势力相同的所有其他角色▶你与这些角色各摸三张牌。若你的势力是角色数最小的势力，你回复1点体力}。',
            audios: [
                {
                    url: 'generals/mateng/xiongyi1',
                    lang: '弟兄们，我们的机会来啦！',
                },
                {
                    url: 'generals/mateng/xiongyi2',
                    lang: '此时不战，更待何时！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.kongrong', {
    title: '凛然重义',
    rs: '祢衡',
    death_audio: '覆巢之下，岂有完卵……',
    skills: {
        ['wars.kongrong.mingshi']: {
            name: '名士',
            desc: '锁定技，当你受到伤害时，若伤害来源有暗置的武将牌，此伤害-1。',
            desc2: '锁定技，当你受到伤害时❷，若来源有暗置的武将牌，你令伤害值-1。',
            audios: [
                {
                    url: 'generals/kongrong/mingshi1',
                    lang: '孔门之后，忠孝为先。',
                },
                {
                    url: 'generals/kongrong/mingshi2',
                    lang: '名士之风，仁义高洁。',
                },
            ],
        },
        ['wars.kongrong.lirang']: {
            name: '礼让',
            desc: '当你的牌因弃置而置入弃牌堆时，你可以将其中的任意张牌交给其他角色。',
            desc2: '当你的牌因弃置而移至弃牌堆后❷，你可将其中的至少一张牌交给其他角色。',
            audios: [
                {
                    url: 'generals/kongrong/lirang1',
                    lang: '夫礼先王以承天之道，以治人之情。',
                },
                {
                    url: 'generals/kongrong/lirang2',
                    lang: '谦者，德之柄也，让者，礼之主也。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.jiling', {
    title: '仲家的主将',
    rs: '袁术',
    death_audio: '将军为何咆哮不断……',
    skills: {
        ['wars.jiling.shuangren']: {
            name: '双刃',
            desc: '出牌阶段开始时，你可以与一名角色拼点：\n若你赢，你视为对其或与其势力相同的另一名角色使用一张【杀】；\n若你没赢，你结束出牌阶段。',
            desc2: '出牌阶段开始时，你可与一名角色拼点▶若你：赢，你对与其势力相同的一名角色使用无对应的实体牌的普【杀】；未赢，你结束出牌阶段。',
            audios: [
                {
                    url: 'generals/jiling/shuangren1',
                    lang: '仲国大将纪灵在此！',
                },
                {
                    url: 'generals/jiling/shuangren2',
                    lang: '吃我一记三尖两刃刀！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.v2025.jiling', {
    version: '2025移动版修订',
    title: '仲家的主将',
    image_url: 'generals/jiling/image',
    rs: '袁术',
    death_audio: '将军为何咆哮不断……',
    skills: {
        ['wars.v2025.jiling.shuangren']: {
            name: '双刃',
            desc: '出牌阶段开始时，你可以与一名角色拼点：\n若你赢，你视为对其或与其势力相同的另一名角色使用一张【杀】；\n若你没赢，此阶段你不能对其他角色使用牌。',
            desc2: '出牌阶段开始时，你可与一名角色拼点▶若你：赢，你对与其势力相同的一名角色使用无对应的实体牌的普【杀】；未赢，此阶段你不能对其他角色使用牌。',
            audios: [
                {
                    url: 'generals/jiling/shuangren1',
                    lang: '仲国大将纪灵在此！',
                },
                {
                    url: 'generals/jiling/shuangren2',
                    lang: '吃我一记三尖两刃刀！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.tianfeng', {
    title: '河北瑰杰',
    death_audio: '不纳吾言而反诛吾心，奈何奈何……',
    skills: {
        ['wars.tianfeng.sijian']: {
            name: '死谏',
            desc: '当你失去最后的手牌时，你可以弃置一名其他角色的一张牌。',
            desc2: '当你失去手牌后❷，若你没有手牌，你可弃置一名其他角色的一张牌。',
            audios: [
                {
                    url: 'generals/tianfeng/sijian1',
                    lang: '忠言逆耳啊！！',
                },
                {
                    url: 'generals/tianfeng/sijian2',
                    lang: '且听我最后一言！',
                },
            ],
        },
        ['wars.tianfeng.suishi']: {
            name: '随势',
            desc: '锁定技，当其他角色进入濒死状态时，若伤害来源与你势力相同，你摸一张牌；\n当其他角色死亡时，若其与你势力相同，你失去1点体力。',
            desc2: '①锁定技，当其他角色因受到伤害而进入濒死状态时，若来源与你势力相同，你摸一张牌。②锁定技，当其他角色死亡时，若其与你势力相同，你失去1点体力。',
            audios: [
                {
                    url: 'generals/tianfeng/suishi1',
                    lang: '一损俱损……',
                },
                {
                    url: 'generals/tianfeng/suishi2',
                    lang: '一荣俱荣！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.v2025.tianfeng', {
    version: '2025移动版修订',
    title: '河北瑰杰',
    image_url: 'generals/tianfeng/image',
    death_audio: '不纳吾言而反诛吾心，奈何奈何……',
    skills: {
        ['wars.tianfeng.sijian']: {
            name: '死谏',
            desc: '当你失去最后的手牌时，你可以弃置一名其他角色的一张牌。',
            desc2: '当你失去手牌后❷，若你没有手牌，你可弃置一名其他角色的一张牌。',
            audios: [
                {
                    url: 'generals/tianfeng/sijian1',
                    lang: '忠言逆耳啊！！',
                },
                {
                    url: 'generals/tianfeng/sijian2',
                    lang: '且听我最后一言！',
                },
            ],
        },
        ['wars.v2025.tianfeng.suishi']: {
            name: '随势',
            desc: '锁定技，当其他角色进入濒死状态时，若伤害来源与你势力相同，你摸一张牌；\n当其他角色死亡时，若其与你势力相同，你选择一项：\n1.失去1点体力；\n2.弃置所有手牌。',
            desc2: '①锁定技，当其他角色因受到伤害而进入濒死状态时，若来源与你势力相同，你摸一张牌。②锁定技，当其他角色死亡时，若其与你势力相同，你选择：1.你失去1点体力；2.你弃置所有手牌。',
            audios: [
                {
                    url: 'generals/tianfeng/suishi1',
                    lang: '一损俱损……',
                },
                {
                    url: 'generals/tianfeng/suishi2',
                    lang: '一荣俱荣！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.panfeng', {
    title: '联军上将',
    death_audio: '潘凤又被华雄斩啦……',
    skills: {
        ['wars.panfeng.kuangfu']: {
            name: '狂斧',
            desc: '当你使用【杀】对目标角色造成伤害后，你可以将其装备区里的一张牌置入你的装备区或弃置之。',
            desc2: '当你因执行你使用的【杀】的效果而对一名角色造成伤害后，你可选择：1.将其装备区里的一张牌置入你的装备区；2.弃置其装备区里的一张牌。',
            audios: [
                {
                    url: 'generals/panfeng/kuangfu1',
                    lang: '吾乃上将潘凤，可斩华雄！',
                },
                {
                    url: 'generals/panfeng/kuangfu2',
                    lang: '这家伙，还是给我用吧！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.v2025.panfeng', {
    version: '2025移动版修订',
    title: '联军上将',
    image_url: 'generals/panfeng/image',
    death_audio: '潘凤又被华雄斩啦……',
    skills: {
        ['wars.v2025.panfeng.kuangfu']: {
            name: '狂斧',
            desc: '当你使用【杀】对目标角色造成伤害后，你可以弃置或获得其的一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/panfeng/kuangfu1',
                    lang: '吾乃上将潘凤，可斩华雄！',
                },
                {
                    url: 'generals/panfeng/kuangfu2',
                    lang: '这家伙，还是给我用吧！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zoushi', {
    title: '惑心之魅',
    death_audio: '年老色衰了吗？',
    skills: {
        ['wars.zoushi.huoshui']: {
            name: '祸水',
            desc: '锁定技，你的回合内，其他角色不能明置其武将牌。',
            desc2: '锁定技，其他角色于你的回合内不能明置武将牌。',
            audios: [
                {
                    url: 'generals/zoushi/huoshui1',
                    lang: '走不动了嘛？',
                },
                {
                    url: 'generals/zoushi/huoshui2',
                    lang: '别走了在玩一会嘛？',
                },
            ],
        },
        ['wars.zoushi.qingcheng']: {
            name: '倾城',
            desc: '出牌阶段，你可以弃置一张黑色牌并选择一名武将牌均明置的其他角色，然后你暗置其一张武将牌。\n若你弃置的牌是装备牌，则你可以再选择另一名角色重复此操作。',
            desc2: '出牌阶段，你可弃置一张黑色牌并选择一名所有武将牌均处于明置状态的其他角色▶其暗置你选择的其一张不为君主武将牌且不为士兵牌的武将牌。若你以此法弃置的牌为装备牌，你可选择另一名所有武将牌均处于明置状态的其他角色。其暗置你选择的其一张不为君主武将牌且不为士兵牌的武将牌。',
            audios: [
                {
                    url: 'generals/zoushi/qingcheng1',
                    lang: '我和你们真是投缘啊。',
                },
                {
                    url: 'generals/zoushi/qingcheng2',
                    lang: '哼，眼睛都直了呀。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simayi_jin', {
    title: '冢虎',
    rs: '张春华',
    death_audio: '虎入骷冢，司马难兴。',
    skills: {
        ['wars.simayi_jin.yingshi']: {
            name: '鹰视',
            desc: '出牌阶段开始时，你可以令一名角色视为对你选择的另一名角色使用【知己知彼】，然后若此牌的使用者不为你，你摸一张牌。',
            desc2: '出牌阶段开始时，你可选择一名角色A与是A使用无对应的实体牌的【知己知彼】的合法目标的另一名角色B▶A对B使用无对应的实体牌的【知己知彼】。若A不为你，你摸一张牌。',
            audios: [
                {
                    url: 'generals/simayi_jin/yingshi1',
                    lang: '鹰扬千里，明察秋毫。',
                },
                {
                    url: 'generals/simayi_jin/yingshi2',
                    lang: '鸢飞戾天，目入百川。',
                },
            ],
        },
        ['wars.simayi_jin.shunfu']: {
            name: '瞬覆',
            desc: '限定技，出牌阶段，你可令至多三名未确定势力的其他角色各摸两张牌，然后这些角色依次选择是否使用一张无距离限制且不可响应的【杀】。',
            desc2: '限定技，出牌阶段，你可选择至多三名没有势力的其他角色并获得1枚"覆"▶这些角色各{摸两张牌，可使用【杀】（无距离关系的限制）}。\n◆一名角色因执行〖瞬覆〗的效果而使用的【杀】不是牌的合法目标。',
            audios: [
                {
                    url: 'generals/simayi_jin/shunfu1',
                    lang: '巍巍隐帝，岂可为臣？',
                },
                {
                    url: 'generals/simayi_jin/shunfu2',
                    lang: '乱世之中，唯我司马！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.zhangchunhua_jin', {
    title: '冷血皇后',
    rs: '司马懿',
    death_audio: '我不负懿，懿负我……',
    skills: {
        ['wars.zhangchunhua_jin.ejue']: {
            name: '扼绝',
            desc: '锁定技，当你使用【杀】对一名角色造成伤害时，若其势力未确定，此伤害+1。',
            desc2: '锁定技，当你对一名角色造成渠道为【杀】的伤害时❶，若使用者为你且其没有势力，你令伤害值+1。',
            audios: [
                {
                    url: 'generals/zhangchunhua_jin/ejue1',
                    lang: '莫说是你，天皇贵胄亦可杀得！',
                },
                {
                    url: 'generals/zhangchunhua_jin/ejue2',
                    lang: '你我不到黄泉，不复相见！',
                },
            ],
        },
        ['wars.zhangchunhua_jin.shangshi']: {
            name: '伤逝',
            desc: '每名角色回合结束时，你可以将手牌摸至你的已损失体力值。',
            desc2: '一名角色的回合结束前❶，你可将手牌补至X张（X为你已损失的体力值）。',
            audios: [
                {
                    url: 'generals/zhangchunhua_jin/shangshi1',
                    lang: '伤我最深的，竟是你司马懿。',
                },
                {
                    url: 'generals/zhangchunhua_jin/shangshi2',
                    lang: '世间刀剑数万，何以情字伤人？',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simashi', {
    title: '睚眦侧目',
    rs: '羊徽瑜',
    death_audio: '子上，这是为兄给你打下的江山……',
    skills: {
        ['wars.simashi.yimie']: {
            name: '夷灭',
            desc: '锁定技，你的回合内，与处于濒死状态的角色势力相同的角色不能使用【桃】；\n与处于濒死状态的角色势力不同的角色可以将一张红桃牌当【桃】使用。',
            desc2: '锁定技，当一名角色A于你的回合内进入濒死状态后，你获得1枚"夷"▶A于此濒死流程中不是与其势力相同的角色使用【桃】的合法目标→当一名角色B于此濒死流程中需要对A使用【桃】（使用方法②）时❸，若其与A势力不同，其可使用对应的实体牌为其一张红桃手牌的【桃】（使用方法②）。',
            audios: [
                {
                    url: 'generals/simashi/yimie1',
                    lang: '汝大逆不道，当死无赦！',
                },
                {
                    url: 'generals/simashi/yimie2',
                    lang: '斩草除根，灭其退路！',
                },
            ],
        },
        ['wars.simashi.ruilue']: {
            name: '睿略',
            desc: '未确定势力其他角色出牌阶段限一次，其可以展示并交给你一张伤害类牌，然后其摸一张牌。',
            desc2: '没有势力的其他角色的出牌阶段限一次，其可展示一张【杀】或伤害锦囊牌▶其将此牌交给你，摸一张牌。',
            audios: [
                {
                    url: 'generals/simashi/ruilue1',
                    lang: '司马当兴，其兴在吾。',
                },
                {
                    url: 'generals/simashi/ruilue2',
                    lang: '吾承父志，故知军事，通谋略。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simazhao', {
    title: '嘲风开天',
    rs: '王元姬',
    death_audio: '司马三代，一梦成空……',
    skills: {
        ['wars.simazhao.zhaoran']: {
            name: '昭然',
            desc: '出牌阶段开始时，你可以摸X张牌（X为4-场上势力数），然后未确定势力角色可以明置其一张武将牌令你结束此回合。',
            desc2: '出牌阶段开始时，你可摸X张牌（X=4-势力数）▶所有没有势力的角色各可明置其一张武将牌▷你结束此回合。',
            audios: [
                {
                    url: 'generals/simazhao/zhaoran1',
                    lang: '行昭然于世，赦众贼以威。',
                },
                {
                    url: 'generals/simazhao/zhaoran2',
                    lang: '吾之心思，路人皆知。',
                },
            ],
        },
        ['wars.simazhao.beiluan']: {
            name: '备乱',
            desc: '当你受到伤害后，你可以令伤害来源所有非装备手牌均视为【杀】，直到此回合结束。',
            desc2: '当你受到伤害后，你可获得1枚"备"▶来源不为装备牌的手牌的牌名于此回合内均视为【杀】且此【杀】为普【杀】。',
            audios: [
                {
                    url: 'generals/simazhao/beiluan1',
                    lang: '秣马厉兵，筹伐不臣！',
                },
                {
                    url: 'generals/simazhao/beiluan2',
                    lang: '枕戈待旦，秣马征平。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simazhou', {
    title: '温恭的狻猊',
    death_audio: '恩赐重物，病身难消受……',
    skills: {
        ['wars.simazhou.pojing']: {
            name: '迫境',
            desc: '出牌阶段限一次，你可以令一名其他角色选择一项：\n1.令你获得其区域内的一张牌；\n2.所有与你势力相同的角色可以明置任意张武将牌并对其造成等量伤害。',
            desc2: '出牌阶段限一次，你可令一名其他角色A选择：1.令你获得A区域里的一张牌▶你获得1枚"境"；2.获得1枚"迫"▶你令所有与你势力相同或没有势力的其他角色各选择：{1.若其（明置后会）与你势力相同，其明置一张武将牌▷其对A造成1点普通伤害；2.若其（明置后会）与你势力相同，其同时明置两张武将牌▷其对A造成2点普通伤害；3.获得1枚"境"}。',
            audios: [
                {
                    url: 'generals/simazhou/pojing1',
                    lang: '奉命伐吴，得胜纳降。',
                },
                {
                    url: 'generals/simazhou/pojing2',
                    lang: '进军逼江，震慑吴贼。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simaliang', {
    title: '冲粹的蒲牢',
    death_audio: '生此篡逆之世，罪臣难辞其咎……',
    skills: {
        ['wars.simaliang.gongzhi']: {
            name: '共执',
            desc: '你可以跳过摸牌阶段，令与你势力相同的角色依次摸一张牌，直至共计摸到四张。',
            desc2: '摸牌阶段开始前，你可跳过此阶段▶所有与你势力相同的角色各{获得1枚"执"。若所有角色此次因执行此技能的效果而得到的牌数之和小于4，其摸一张牌}。若所有角色此次因执行此技能的效果而得到的牌数之和小于4，你重复此流程。',
            audios: [
                {
                    url: 'generals/simaliang/gongzhi1',
                    lang: '身负托孤之重，但坐论清谈，此亦可乎？',
                },
                {
                    url: 'generals/simaliang/gongzhi2',
                    lang: '陛下用人之际，臣岂敢身退庙堂。',
                },
            ],
        },
        ['wars.simaliang.sheju']: {
            name: '慑惧',
            desc: '锁定技，当其他角色明置武将牌后，若其与你势力相同，你回复1点体力，然后弃置所有手牌。',
            desc2: '锁定技，当一名其他角色明置武将牌后，若其与你势力相同，你回复1点体力▶你弃置所有手牌。',
            audios: [
                {
                    url: 'generals/simaliang/sheju1',
                    lang: '臣怀二心，不可事君也。',
                },
                {
                    url: 'generals/simaliang/sheju2',
                    lang: '今观汝之行事，老夫亦肝心俱裂。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.simalun', {
    title: '螭吻裂冠',
    death_audio: '大事当以急行，而不可缓图……',
    skills: {
        ['wars.simalun.zhulan']: {
            name: '助澜',
            desc: '当一名其他角色受到伤害时，若伤害来源与其势力相同，你可以弃置一张牌令此伤害+1。',
            desc2: '当一名其他角色受到伤害时❷，若来源与其势力相同，你可弃置一张牌▶此伤害值+1。',
            audios: [
                {
                    url: 'generals/simalun/zhulan1',
                    lang: '整顿天下，为国除害！',
                },
                {
                    url: 'generals/simalun/zhulan2',
                    lang: '陛下在哪？陛下在哪！',
                },
            ],
        },
        ['wars.simalun.luanchang']: {
            name: '乱常',
            desc: '限定技，与你势力相同的角色受到伤害的回合结束时，你可以令当前回合角色将所有手牌（至少一张）当【万箭齐发】使用。',
            desc2: '限定技，一名角色的回合结束前❶，若有与你（明置后会）势力相同的角色于此回合内受到过伤害，你可令当前回合角色使用对应的实体牌为其所有手牌的【万箭齐发】。',
            audios: [
                {
                    url: 'generals/simalun/luanchang1',
                    lang: '欲扫清寰宇，重振朝纲，必诛奸宦。',
                },
                {
                    url: 'generals/simalun/luanchang2',
                    lang: '杀了你们，天下都是我说了算！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.shibao', {
    title: '经国之才',
    death_audio: '寒门出身，难以擢升……',
    skills: {
        ['wars.shibao.zhuosheng']: {
            name: '擢升',
            desc: '当你得到牌后，你可以令你本回合使用的下一张牌造成的伤害+1（不可叠加）。',
            desc2: '当你得到牌后❷，若你于当前回合内未发动过此技能或于使用过上一张牌后未发动过此技能，你可获得1枚"升"▶你于此回合内使用的下一张牌的伤害值基数+1。',
            audios: [
                {
                    url: 'generals/shibao/zhuosheng1',
                    lang: '才经世务，干用之绩。',
                },
                {
                    url: 'generals/shibao/zhuosheng2',
                    lang: '器量之远，当至公辅。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.yanghuiyu', {
    title: '克明礼教',
    rs: '司马师',
    death_audio: '韶华易老，佳容不再……',
    skills: {
        ['wars.yanghuiyu.ciwei']: {
            name: '慈威',
            desc: '你的回合内，当其他角色使用牌时，若场上有本回合使用或打出过牌且不与其势力相同的其他角色，你可以弃置一张牌令之无效。',
            desc2: '当牌于你的回合内被使用时，若使用者不为你且有{于此回合内使用/打出过牌且不为与使用者势力相同的角色}的其他角色，你可弃置一张牌▶你取消此牌的所有目标。',
            audios: [
                {
                    url: 'generals/yanghuiyu/ciwei1',
                    lang: '乃家乃邦，是则是效。',
                },
                {
                    url: 'generals/yanghuiyu/ciwei2',
                    lang: '其慈有威，不舒不暴。',
                },
            ],
        },
        ['wars.yanghuiyu.caiyuan']: {
            name: '才媛',
            desc: '锁定技，若你的武将牌均明置：回合开始时，你摸两张牌；\n当你受到伤害后，你暗置此武将牌。',
            desc2: '①锁定技，回合开始后❾，若你的武将牌均处于明置状态且你于此回合内未明置过此武将牌，你摸两张牌。②锁定技，当你受到伤害后，若你的武将牌均处于明置状态，你暗置此武将牌。',
            audios: [
                {
                    url: 'generals/yanghuiyu/caiyuan1',
                    lang: '柳絮轻舞，撷芳赋诗。',
                },
                {
                    url: 'generals/yanghuiyu/caiyuan2',
                    lang: '秀媛才德，知书达理。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.wangyuanji', {
    title: '垂心万物',
    rs: '司马昭',
    death_audio: '祖父已逝，哀凄悲戚……',
    skills: {
        ['wars.wangyuanji.yanxi']: {
            name: '宴戏',
            desc: '准备阶段，你可以选择至多三名其他势力角色的各一张手牌，这些角色依次声明一个牌名，然后你展示并获得其中一张牌，若此牌牌名与其声明的不同，你再获得其余被选择的牌。',
            desc2: '准备阶段开始时，你可选择至多三名{与你（明置后会）势力不同或没有势力}的其他角色的各一张手牌▶这些角色各为其以此法被选择的牌记录一个牌名。你展示你以此法选择的牌中的一张，获得此牌。若你以此法展示的牌的牌名与此牌因此次执行此技能的效果而被记录的牌名不同，你获得其余的你以此法选择的牌。',
            audios: [
                {
                    url: 'generals/wangyuanji/yanxi1',
                    lang: '宴会嬉趣，其乐融融。',
                },
                {
                    url: 'generals/wangyuanji/yanxi2',
                    lang: '宴中趣玩，得遇知己。',
                },
            ],
        },
        ['wars.wangyuanji.shiren']: {
            name: '识人',
            desc: '每回合限一次，当未确定势力的其他角色受到伤害后，你可以交给其两张牌并摸两张牌。',
            desc2: '当一名其他角色受到伤害后，若其没有势力，你可交给其两张牌▶你摸两张牌。',
            audios: [
                {
                    url: 'generals/wangyuanji/shiren1',
                    lang: '宠过必乱，不可大任。',
                },
                {
                    url: 'generals/wangyuanji/shiren2',
                    lang: '开卷有益，识人有法。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.weiguan', {
    title: '忠允清識',
    death_audio: '辞荣善终，不可求……',
    skills: {
        ['wars.weiguan.chengxi']: {
            name: '乘隙',
            desc: '准备阶段，你可以令一名角色视为使用一张【以逸待劳】，结算后若以此法弃置的牌中包含非基本牌，则此牌使用者对所有目标各造成1点伤害。',
            desc2: '准备阶段开始时，你可令一名角色使用无对应的实体牌的【以逸待劳】▶（→）此牌使用结算结束后❸，若有角色因执行此牌的效果而弃置了不为基本牌的牌，使用者对此牌的所有目标对应的角色各造成1点普通伤害。',
            audios: [
                {
                    url: 'generals/weiguan/chengxi1',
                    lang: '考其遗法，肃若神明。',
                },
                {
                    url: 'generals/weiguan/chengxi2',
                    lang: '气韵生动，出于天成。',
                },
            ],
        },
        ['wars.weiguan.jiantong']: {
            name: '监统',
            desc: '当你受到伤害后，你可以观看一名角色的手牌，然后你可以用装备区内的一张牌交换其中至多两张牌。',
            desc2: '当你受到伤害后，你可观看一名角色的手牌并可选择{其中的至多两张牌与你装备区里的一张牌}▶你与其交换这些牌。',
            audios: [
                {
                    url: 'generals/weiguan/jiantong1',
                    lang: '秉公行事，无所亲疏。',
                },
                {
                    url: 'generals/weiguan/jiantong2',
                    lang: '明晰法理，通晓人情。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.jiachong', {
    title: '悖逆篡弑',
    rs: '郭槐',
    death_audio: '任元褒，吾与汝势不两立！',
    skills: {
        ['wars.jiachong.chujue']: {
            name: '除绝',
            desc: '锁定技，你对有角色死亡的势力的角色使用牌无次数限制且不可被这些角色响应。',
            desc2: '①锁定技，你对{有与其势力相同的已死亡的角色}的角色使用牌无次数的限制。②锁定技，当牌被使用时，若使用者为你，你选择所有{有与其势力相同的已死亡的角色}的角色并获得1枚"绝"▶这些角色均不能响应此牌。',
            audios: [
                {
                    url: 'generals/jiachong/chujue1',
                    lang: '怀志拥权，谁敢不服。',
                },
                {
                    url: 'generals/jiachong/chujue2',
                    lang: '天下凶凶，由我一人！',
                },
            ],
        },
        ['wars.jiachong.jianzhi']: {
            name: '奸志',
            desc: '当你造成伤害时，若伤害值不小于受伤角色的体力值，你可以弃置所有手牌（至少一张），然后本回合下次击杀奖励改为三倍。',
            desc2: '当你造成伤害时❷，若此伤害值不小于其体力值，你可弃置所有手牌▶你于此回合内下一次因你杀死角色而执行奖惩的规则改为{ 若死亡的角色与杀死其的角色势力：相同，杀死其的角色弃置所有牌；不同且杀死其的角色为野心家，杀死其的角色摸九张牌；不同且杀死其的角色不为野心家，杀死其的角色摸3X张牌（X为与死亡的角色势力相同的角色数+1） }。',
            audios: [
                {
                    url: 'generals/jiachong/jianzhi1',
                    lang: '一箭之仇，十年不忘！',
                },
                {
                    url: 'generals/jiachong/jianzhi2',
                    lang: '此仇不报，怨恨难消！',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.guohuai_jin', {
    title: '嫉贤妒能',
    rs: '贾充',
    death_audio: '我死后，切勿从粲、午之言……',
    skills: {
        ['wars.guohuai_jin.zhefu']: {
            name: '哲妇',
            desc: '当你于回合外使用或打出基本牌后，你可以观看一名同势力角色数不小于你的角色的手牌，然后你可以弃置其中一张基本牌。',
            desc2: '当基本牌于你的回合外使用结算结束后❸/打出结算结束后，若使用者/打出者为你，你可观看一名{与其势力相同的角色数不小于与你势力相同的角色数}的手牌并可弃置其中的一张基本牌。',
            audios: [
                {
                    url: 'generals/guohuai_jin/zhefu1',
                    lang: '非我善妒，实乃汝之过也。',
                },
                {
                    url: 'generals/guohuai_jin/zhefu2',
                    lang: '履行不端者，当有此罚。',
                },
            ],
        },
        ['wars.guohuai_jin.weidu']: {
            name: '遗毒',
            desc: '当你使用伤害类牌后，你可以展示一名未受到此牌伤害的目标角色至多两张手牌，若颜色相同，你弃置这些牌。',
            desc2: '当【杀】或伤害锦囊牌使用结算结束后❸，若使用者为你，你可选择一名此牌最终目标列表中的一个未受到过渠道为此牌的伤害的角色并展示其至多两张手牌▶若这些牌的颜色均相同，你弃置这些牌。',
            audios: [
                {
                    url: 'generals/guohuai_jin/weidu1',
                    lang: '彼之砒霜，吾之蜜糖。',
                },
                {
                    url: 'generals/guohuai_jin/weidu2',
                    lang: '巧动心思，以遗他人。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.wangjun', {
    title: '顺流长驱',
    death_audio: '吾功大无匹，但为浑父子所抑而已……',
    skills: {
        ['wars.wangjun.chengliu']: {
            name: '乘流',
            desc: '出牌阶段限一次，你可以对一名装备区内的牌数小于你的角色造成1点伤害，然后你可以与其交换装备区内的牌并重复此流程。',
            desc2: '出牌阶段限一次，你可对一名装备区里的牌数小于你的角色造成1点普通伤害▶你可与其交换装备区里的牌▷你重复此流程。\n◆此流程即"你对一名装备区里的牌数小于你的角色造成1点普通伤害▷你可与其交换装备区里的牌▷你重复此流程"。',
            audios: [
                {
                    url: 'generals/wangjun/chengliu1',
                    lang: '顺流鼓棹，径造三山。',
                },
                {
                    url: 'generals/wangjun/chengliu2',
                    lang: '今威名已著，当直取敌都。',
                },
            ],
        },
    },
});
sgs.loadGeneralTranslation('wars.malong', {
    title: '困局诡阵',
    death_audio: '惟愿长守边境，不使百姓为虏所扰……',
    skills: {
        ['wars.malong.zhuanzhan']: {
            name: '转战',
            desc: '锁定技，若场上有未确定势力角色，你使用【杀】无距离限制且不能指定确定势力角色为目标。',
            desc2: '锁定技，若有没有势力的角色，你使用【杀】无距离关系的限制且有势力的角色不是你使用【杀】的合法目标。',
            audios: [
                {
                    url: 'generals/malong/zhuanzhan1',
                    lang: '幸得陛下厚任，吾当亡命战场，以报所受。',
                },
                {
                    url: 'generals/malong/zhuanzhan2',
                    lang: '敌虽万众之数，以吾之谋，易为平之。',
                },
            ],
        },
        ['wars.malong.xunji']: {
            name: '勋济',
            desc: '你使用【杀】可以多指定至多两名目标，结算后若对所有目标均造成伤害，此【杀】不计次数。',
            desc2: '当【杀】选择目标后，若使用者为你，你可令至多两名角色也成为此牌的目标▶（→）此牌使用结算结束后❷，若你因执行此牌的效果而对所有目标对应的角色均造成过伤害，你令此【杀】不计入限制的次数。',
            audios: [
                {
                    url: 'generals/malong/xunji1',
                    lang: '天统之境，岂容丑虏犯边。',
                },
                {
                    url: 'generals/malong/xunji2',
                    lang: '凉州有危，臣者当济。',
                },
            ],
        },
    },
});
