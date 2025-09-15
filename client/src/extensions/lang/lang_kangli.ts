sgs.GeneralSetting('xl.caozhi', {
    title: '白马落泞',
    rs: '崔妃 杨修',
    death_audio: '枯桑知天风，海水知天寒。',
    image_url: 'generals/xl/xl.caozhi/image',
    death_url: 'generals/xl/xl.caozhi/death',

    skills: {
        ['xl.caozhi.linlang']: {
            name: '琳琅',
            desc: '当一名角色的判定牌生效后，若此牌为锦囊牌，你可以选择一项：\n1.当此牌因判定置入弃牌堆时，获得此牌；\n2.移动场上一张与此牌颜色相同的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.caozhi/linlang1',
                    lang: '美玉生盘石，宝剑出龙渊。',
                },
                {
                    url: 'generals/xl/xl.caozhi/linlang2',
                    lang: '歌吟慷慨志，大魏承天机。',
                },
            ],
        },
        ['xl.caozhi.luoying']: {
            name: '落英',
            desc: '当你平置武将牌时，你可以判定：若为梅花，你可以于当前回合结束后，执行一个仅有出牌阶段的回合。\n当你受到伤害后，你可以摸X张牌并叠置武将牌（X为你已损失的体力值）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.caozhi/luoying1',
                    lang: '灵芝生王地，朱草被洛滨。',
                },
                {
                    url: 'generals/xl/xl.caozhi/luoying2',
                    lang: '君王礼英贤，不吝千金璧。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.cuifei', {
    title: '锦雀据棘',
    rs: '曹植',
    death_audio: '侯门似海，罗衣委尘……',
    image_url: 'generals/xl/xl.cuifei/image',
    death_url: 'generals/xl/xl.cuifei/death',

    skills: {
        ['xl.cuifei.yixiu']: {
            name: '衣绣',
            desc: '当你获得牌后，你可以展示并使用其中的任意张装备牌，然后摸等量的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.cuifei/yixiu1',
                    lang: '金缕曳流霞，佩玉鸣清商。',
                },
                {
                    url: 'generals/xl/xl.cuifei/yixiu2',
                    lang: '华琚绣明月，云鬓缀琳琅。',
                },
            ],
        },
        ['xl.cuifei.yashang']: {
            name: '雅殇',
            desc: '锁定技，当你受到伤害后，若伤害来源：\n与你势力不同，其将手牌弃置至X张；\n与你势力相同，你将手牌弃置至X张。\n若未因此技能弃牌，则改为另一名角色将手牌补至X张（X为你的空置装备栏数）。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.cuifei/yashang1',
                    lang: '霓裳竟成罪，玉台蒙尘霜。',
                },
                {
                    url: 'generals/xl/xl.cuifei/yashang2',
                    lang: '寸帛皆逾制，素衣谢君王。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.guansuo', {
    title: '拢营簪花',
    rs: '王桃王悦',
    death_audio: '大义当前，岂可做儿女之态。',
    image_url: 'generals/xl/xl.guansuo/image',
    death_url: 'generals/xl/xl.guansuo/death',

    skills: {
        ['xl.guansuo.zhengfeng']: {
            name: '征锋',
            desc: '一名与你势力相同的角色的准备阶段，你可以使用一张【杀】。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.guansuo/zhengfeng1',
                    lang: '将军稍待，容我先行。',
                },
                {
                    url: 'generals/xl/xl.guansuo/zhengfeng2',
                    lang: '吾初见父面，岂可为人所轻？',
                },
            ],
        },
        ['xl.guansuo.lvjin']: {
            name: '旅进',
            desc: '主将技。每回合限一次，当你使用的【杀】造成伤害后，你可以将此牌交给一名其他角色。若其为女性角色，其获得一个“阴阳鱼”标记。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.guansuo/lvjin1',
                    lang: '世乱多聚山贼，吾等有备无患。',
                },
                {
                    url: 'generals/xl/xl.guansuo/lvjin2',
                    lang: '此去路遥山险，夫人还当小心。',
                },
            ],
        },
        ['xl.guansuo.muyang']: {
            name: '募养',
            desc: '副将技，你计算体力上限时减少1个单独的阴阳鱼。\n结束阶段，你可以亮出牌堆顶的两张牌，获得其中的红色牌和【杀】。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.guansuo/muyang1',
                    lang: '待吾病痊愈，誓为父报仇。',
                },
                {
                    url: 'generals/xl/xl.guansuo/muyang2',
                    lang: '可有英勇壮士，随我匡汉建功。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.wangtaowangyue', {
    title: '刀钗并舞',
    rs: '关索',
    death_audio: '恨不能与夫君再守此关。',
    image_url: 'generals/xl/xl.wangtaowangyue/image',
    death_url: 'generals/xl/xl.wangtaowangyue/death',

    skills: {
        ['xl.wangtaowangyue.shuying']: {
            name: '姝营',
            desc: '锁定技，你的攻击范围+1；\n你的手牌上限+1；\n当判定阵法关系时，你视为两名相邻角色。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wangtaowangyue/shuying1',
                    lang: '吾等有此武艺，克敌又有何难。',
                },
                {
                    url: 'generals/xl/xl.wangtaowangyue/shuying2',
                    lang: '男子精谋善战，女子亦可杀敌。',
                },
            ],
        },
        ['xl.wangtaowangyue.huyi']: {
            name: '虎翼',
            desc: '阵法技，每回合限一次，当一名与你处于同一队列的角色使用【杀】结算后，若与此队列相邻的角色为目标之一，你可对另一名与此队列相邻的角色使用一张不计入次数的【杀】。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.wangtaowangyue/huyi1',
                    lang: '夫君得妾身相助，自如虎添翼。',
                },
                {
                    url: 'generals/xl/xl.wangtaowangyue/huyi2',
                    lang: '妾有儿郎五万，何惧西川之险。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.zhuju', {
    title: '舌嚼喉鲠',
    rs: '孙鲁育',
    death_audio: '望我一腔碧血，可转陛下之意。',
    image_url: 'generals/xl/xl.zhuju/image',
    death_url: 'generals/xl/xl.zhuju/death',

    skills: {
        ['xl.zhuju.liangzhi']: {
            name: '良执',
            desc: '每回合限一次，当你使用基本牌或普通锦囊牌时，你可以额外选择一名有暗置武将牌的其他角色为目标。\n当此牌结算后，其可以明置一张武将牌并弃置或摸一张牌，视为对你使用一张【杀】或【桃】。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhuju/liangzhi1',
                    lang: '君有王佐之才，但待鹏举之期。',
                },
                {
                    url: 'generals/xl/xl.zhuju/liangzhi2',
                    lang: '今献君微礼，恐贻笑方家。',
                },
            ],
        },
        ['xl.zhuju.cizheng']: {
            name: '辞正',
            desc: '每轮限一次，其他角色的出牌阶段开始时，若其体力值不小于你，你可以弃置一张牌并对其献策。其出牌阶段须选择一项：\n1.令一名与你势力不同的角色执行妙计；\n2.弃置此妙计，跳过本回合的弃牌阶段。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhuju/cizheng1',
                    lang: '事关一国之安，据必守之以死。',
                },
                {
                    url: 'generals/xl/xl.zhuju/cizheng2',
                    lang: '愿陛下三思而行，不致社稷危乱。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.sunluyu', {
    title: '二宫堂燕',
    rs: '朱据',
    death_audio: '天理昭昭，姐姐终会自食其果……',
    image_url: 'generals/xl/xl.sunluyu/image',
    death_url: 'generals/xl/xl.sunluyu/death',

    skills: {
        ['xl.sunluyu.mumu']: {
            name: '穆穆',
            desc: '当一名角色使用牌选择包含你在内的多个目标时，若你与此牌使用者：\n相邻，你可以选择一项：1.弃置其一张牌；2.令其摸一张牌。\n不相邻，你可以弃置一张牌并选择其中一个目标，取消之。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.sunluyu/mumu1',
                    lang: '干政已是大忌，更况谮害忠良乎？',
                },
                {
                    url: 'generals/xl/xl.sunluyu/mumu2',
                    lang: '国事自有公卿相佐，非吾等女子所能干涉。',
                },
            ],
        },
        ['xl.sunluyu.biebao']: {
            name: '别抱',
            desc: '当你失去装备区里的牌后，你可以与一名与你势力相同的其他角色交换副将，然后你可以令一名体力值最小的角色回复1点体力。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.sunluyu/biebao1',
                    lang: '犹记去岁今日，夫君拥我怀中。',
                },
                {
                    url: 'generals/xl/xl.sunluyu/biebao2',
                    lang: '既为家国稳固，儿臣谨遵皇命。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.zhangze', {
    title: '卧虎',
    rs: '陈慧谦',
    death_audio: '而今可卫土一方，吾已无所憾矣。',
    image_url: 'generals/xl/xl.zhangze/image',
    death_url: 'generals/xl/xl.zhangze/death',

    skills: {
        ['xl.zhangze.xisui']: {
            name: '息绥',
            desc: '每轮每项限一次，当你受到伤害时，你可以将任意张手牌翻转至正面朝上并令伤害来源选择一项：\n1.防止此伤害，其将你的任意张正面朝上的手牌交给任意名其他角色；\n2.展示所有手牌，然后弃置其中所有与你的正面朝上的手牌花色相同的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhangze/xisui1',
                    lang: '示之以柔而迎之以刚，示之以弱而乘之以强。',
                },
                {
                    url: 'generals/xl/xl.zhangze/xisui2',
                    lang: '以己为饵，虚实为用，举措动静，敌莫能识也。',
                },
            ],
        },
        ['xl.zhangze.qingke']: {
            name: '清克',
            desc: '锁定技，当其他角色获得你的牌时，你将此牌翻转至正面朝上。\n当一名角色失去其最后的正面朝上的手牌时，你选择一项：1.其摸一张牌；2.其弃置一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.zhangze/qingke1',
                    lang: '治狄非仅以兵威，亦需怀柔之术。',
                },
                {
                    url: 'generals/xl/xl.zhangze/qingke2',
                    lang: '如此彼消我长，自可徐以破敌。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.chenhuiqian', {
    title: '哲鴷',
    rs: '张则',
    death_audio: '夫君若可去疴除弊，则百姓可安矣。',
    image_url: 'generals/xl/xl.chenhuiqian/image',
    death_url: 'generals/xl/xl.chenhuiqian/death',

    skills: {
        ['xl.chenhuiqian.dejiao']: {
            name: '德教',
            desc: '当一名角色造成伤害时，若此伤害大于1点，或受伤角色本回合第二次受到伤害（每回合限一次），你可以令此伤害-1，并令伤害来源回复1点体力。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.chenhuiqian/dejiao1',
                    lang: '五刑三千，盖亦多矣！',
                },
                {
                    url: 'generals/xl/xl.chenhuiqian/dejiao2',
                    lang: '恢弘德教，养廉免耻。',
                },
            ],
        },
        ['xl.chenhuiqian.jiexu']: {
            name: '诫虚',
            desc: '当一名其他角色使用转化牌/虚拟牌后，或不因使用牌而回复体力后，你可以将其一张手牌翻转至正面朝上，若你正面朝上的手牌数小于你的体力上限，你可以将一张相同花色手牌翻转至正面朝上，摸一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.chenhuiqian/jiexu1',
                    lang: '君子疾没世而不称，不患年不长也。',
                },
                {
                    url: 'generals/xl/xl.chenhuiqian/jiexu2',
                    lang: '神仙愚惑，如系风捕影，非可得也。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.shichong', {
    title: '金谷含悲',
    rs: '绿珠',
    death_audio: '今死东市，乃奴辈利吾家财耳!',
    image_url: 'generals/xl/xl.shichong/image',
    death_url: 'generals/xl/xl.shichong/death',

    skills: {
        ['xl.shichong.haoshe']: {
            name: '豪奢',
            desc: '锁定技，你视为装备着后备区里点数最大的装备牌，若此装备牌为武器牌，则此牌的攻击范围取后备区里的武器牌的最大值。\n当其他角色使用装备牌时，若后备区里有副类别相同的牌，其须选择一项：\n1. 移存一张牌；\n2. 取消之，然后你弃置后备区里的一张副类别相同的牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.shichong/haoshe1',
                    lang: '此有珊瑚数十，还卿复何足多恨？',
                },
                {
                    url: 'generals/xl/xl.shichong/haoshe2',
                    lang: '尔等为吾婢妾，当丽衣藻饰，岂可褐服？',
                },
            ],
        },
        ['xl.shichong.cefa']: {
            name: '策伐',
            desc: '结束阶段，若你本回合内造成过伤害，你可以移存一名场上有牌的角色的区域里的一张牌。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.shichong/cefa1',
                    lang: '而今贼胆既慑，敌都十日即破也。',
                },
                {
                    url: 'generals/xl/xl.shichong/cefa2',
                    lang: '战贵以势胜敌，不在众寡之用。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('xl.lvzhu', {
    title: '吹楼将坠',
    rs: '石崇',
    death_audio: '此祸皆由妾起，自当效死君前。',
    image_url: 'generals/xl/xl.lvzhu/image',
    death_url: 'generals/xl/xl.lvzhu/death',

    skills: {
        ['xl.lvzhu.jiaorao']: {
            name: '娇娆',
            desc: '当你成为其他角色锦囊牌的目标时，你可以弃置一张同颜色手牌，取消之并选择一项：\n1. 视为你对其使用该牌；\n2. 获得一个阴阳鱼标记。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.lvzhu/jiaorao1',
                    lang: '春思荡尽故作羞，娇多体酥满风流。',
                },
                {
                    url: 'generals/xl/xl.lvzhu/jiaorao2',
                    lang: '宁舞明君曲不休，但使夫君忘前愁。',
                },
            ],
        },
        ['xl.lvzhu.xianghun']: {
            name: '香魂',
            desc: '当你受到伤害时，若伤害值不小于你的体力值，你可以防止此伤害，并将你区域里的所有牌交给一名其他角色，令其在本回合结束后，获得一个额外的回合，然后你死亡。',
            desc2: '',
            audios: [
                {
                    url: 'generals/xl/xl.lvzhu/xianghun1',
                    lang: '此日人非昔日人，笛声空怨赵王伦。',
                },
                {
                    url: 'generals/xl/xl.lvzhu/xianghun2',
                    lang: '红残钿碎花楼下，金谷千年更不春。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.zhongyan', {
    title: '紫闼飞莺',
    rs: '王浑',
    death_audio: '此间天下人，皆分一斗之才。',

    skills: {
        ['wars.zhongyan.guangu']: {
            name: '观骨',
            desc: '出牌阶段开始时，你视为使用一张【知己知彼】，若观看的为暗置武将牌，“啸咏”视为未发动过。',
            desc2: '',
            audios: [
                {
                    url: 'generals/wars/wars.zhongyan/guangu1',
                    lang: '此才拔萃，然观其形骨，恐早夭。',
                },
                {
                    url: 'generals/wars/wars.zhongyan/guangu2',
                    lang: '绯衣者，汝所拔乎？',
                },
            ],
        },
        ['wars.zhongyan.xiaoyong']: {
            name: '啸咏',
            desc: '当你每轮首次于回合外使用一种颜色的牌后，你可以摸一张牌，若颜色相同，你可使用此牌，并重复此流程。',
            desc2: '',
            audios: [
                {
                    url: 'generals/wars/wars.zhongyan/xiaoyong1',
                    lang: '凉风萧条，露沾我衣。',
                },
                {
                    url: 'generals/wars/wars.zhongyan/xiaoyong2',
                    lang: '忧来多方，慨然永怀。',
                },
            ],
        },
    },
});

sgs.GeneralSetting('wars.wanghun', {
    title: '虚怀绥纳',
    rs: '钟琰',
    death_audio: '灭国之功本属我，奈何罔做他人衣。',

    skills: {
        ['wars.wanghun.fuxun']: {
            name: '抚循',
            desc: '当未确定势力角色受到你造成的伤害时，其可以明置一张武将牌并令你将手牌补至体力上限，防止此伤害。',
            desc2: '',
            audios: [
                {
                    url: 'generals/wars/wars.wanghun/fuxun1',
                    lang: '东吴遗民惶惶，宜抚而不宜罚。',
                },
                {
                    url: 'generals/wars/wars.wanghun/fuxun2',
                    lang: '江东新附，不可以严法度之。',
                },
            ],
        },
        ['wars.wanghun.chenya']: {
            name: '沉雅',
            desc: '当你一次性摸牌不少于两张时，你可以放弃摸牌，改为回复1点体力。',
            desc2: '',
            audios: [
                {
                    url: 'generals/wars/wars.wanghun/chenya1',
                    lang: '喜怒不现于形，此为执中之道。',
                },
                {
                    url: 'generals/wars/wars.wanghun/chenya2',
                    lang: '胸有万丈之海，故而波澜不惊。',
                },
            ],
        },
    },
});

export {};
