import { Room } from '../core/entity/Room';
import { LocalTransport } from '../core/transport/LocalTransport';
import { GameCard } from '../core/entity/GameCard';
import { General } from '../core/entity/General';
import { GeneralBuilder } from '../core/builder/GeneralBuilder';
import { sgs } from '../core/sgs';
import {
    defaultCardAudio,
    defaultCardImage,
    defaultGeneralDeath,
    defaultGeneralImage,
    defaultGeneralImageDual,
    defaultGeneralImageDualSelf,
    defaultSkillAudio,
} from '../core/utils/AssetsUtils';
import { CardColor, CardNumber, CardSuit } from '../core/types/CardTypes';
import { Gender, type GeneralData } from '../core/types/GeneralTypes';

/** 冒烟测试：动态资源（默认路径模板 + 卡牌资源 + 武将皮肤/技能语音索引/翻译表） */

// 挂载全局 sgs（实体资源 getter 经 globalThis.sgs 访问静态数据）
sgs.init('preview');

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

function newRoom(): Room {
    return new Room('r1', { responseTime: 1000 }, new LocalTransport());
}

function newCard(room: Room, name: string): GameCard {
    return new GameCard(room, {
        id: 't.p1',
        name,
        suit: CardSuit.Spade,
        color: CardColor.Black,
        number: CardNumber.Number7,
        attr: [],
        derived: false,
    });
}

// ===== 1. 默认路径模板 =====

{
    check(defaultCardImage('sha') === 'image/cards/sha.png', '默认牌图 image/cards/{name}.png');
    check(defaultCardAudio('sha', 'male') === 'audio/card/male/sha.mp3', '默认男声配音 audio/card/male/{name}.mp3');
    check(defaultCardAudio('sha', 'female') === 'audio/card/female/sha.mp3', '默认女声配音 audio/card/female/{name}.mp3');
    check(defaultGeneralImage('caocao', 'default') === 'generals/caocao/default/image.png', '默认插画 generals/{name}/{skin}/image.png');
    check(defaultGeneralImageDual('caocao', 'default') === 'generals/caocao/default/image_dual.png', '默认他人视角插画 image_dual.png');
    check(defaultGeneralImageDualSelf('caocao', 'default') === 'generals/caocao/default/image_dual_self.png', '默认自己视角插画 image_dual_self.png');
    check(defaultGeneralDeath('caocao', 'default') === 'generals/caocao/default/death.mp3', '默认阵亡语音 death.mp3');
    check(defaultSkillAudio('caocao', 'default', 'jianxiong', 1) === 'generals/caocao/default/jianxiong1.mp3', '默认技能语音 {skill}{order}.mp3');
}

// ===== 2. 卡牌资源：未注册走默认，动画分支配音优先 =====

{
    const room = newRoom();
    const card = newCard(room, 'test_sha');
    check(card.getImage() === 'image/cards/test_sha.png', '牌图未注册走默认');
    check(card.getAudio('male') === 'audio/card/male/test_sha.mp3', '配音未注册走默认');

    sgs.registerCardAssets({
        test_sha: {
            image: 'custom/wanjian.png',
            animations: [{ name: 'fire', url: 'anim/fire.mp4', audioMale: 'anim/fire_male.mp3' }],
        },
    });
    check(card.getImage() === 'custom/wanjian.png', '牌图已注册取自定义');
    check(card.getAudio('male') === 'audio/card/male/test_sha.mp3', '无动画指定走默认配音');
    check(card.getAudio('female') === 'audio/card/female/test_sha.mp3', '女声默认配音');
    check(card.getAudio('male', 'fire') === 'anim/fire_male.mp3', '动画分支专属配音优先');
    check(card.getAudio('female', 'fire') === 'audio/card/female/test_sha.mp3', '动画分支无女声回退默认配音');
    check(card.getAudio('male', 'nonexist') === 'audio/card/male/test_sha.mp3', '未知动画分支回退默认配音');
    check(card.getAnimation('fire')?.url === 'anim/fire.mp4', 'getAnimation 取分支');
}

// ===== 3. 武将皮肤：回退链 + defaultSkin =====

{
    const room = newRoom();
    sgs.registerGeneralAssets({
        caocao: {
            name: 'standard.caocao',
            info: {
                id: 'WEI001',
                title: '魏武帝',
                prefix: '界',
                designer: '设计师',
            },
            skills: {
                'standard.caocao.jianxiong': {
                    lang_name: '奸雄',
                    lang_desc: '标准描述',
                    lang_desc2: '规则集描述',
                },
            },
            skins: [
                {
                    name: 'skin1',
                    image: 'g/caocao/skin1/image.png',
                    imageDual: 'g/caocao/skin1/image_dual.png',
                    imageDualSelf: 'g/caocao/skin1/image_dual_self.png',
                    audios: {
                        death: [{ url: 'g/caocao/skin1/death.mp3', text: '曹操皮肤1阵亡台词' }],
                        jianxiong: [
                            { url: 'g/caocao/skin1/jianxiong0.mp3', text: '皮肤1奸雄语音' },
                        ],
                    },
                },
                {
                    name: 'skin2',
                    image: 'g/caocao/skin2/image.png',
                    audios: {
                        jianxiong: [
                            { text: '皮肤2奸雄语音1' },
                            { text: '皮肤2奸雄语音2' },
                        ],
                    },
                },
            ],
        },
    });

    const data = GeneralBuilder('caocao')
        .kingdom('wei')
        .hp(4)
        .gender(Gender.Male)
        .skills(['jianxiong'])
        .defaultSkin('skin2')
        .build();
    const general = new General(room, data);
    check(general.trueName === 'caocao', '真名解析（按真名查资源）');
    check(general.getSkin()?.name === 'skin2', 'getSkin 缺省取 defaultSkin');

    check(general.getImage() === 'g/caocao/skin2/image.png', '默认皮肤取 skin2 插画');
    check(general.getDualImage() === 'g/caocao/skin2/image.png', 'skin2 未配 imageDual 回退 image');
    check(general.getDualImageSelf() === 'g/caocao/skin2/image.png', 'skin2 未配 imageDualSelf 逐级回退 image');
    check(general.getDualImage('skin1') === 'g/caocao/skin1/image_dual.png', 'skin1 配 imageDual 取自定义');
    check(general.getDualImageSelf('skin1') === 'g/caocao/skin1/image_dual_self.png', 'skin1 配 imageDualSelf 取自定义');
    check(general.getDeathAudio() === 'generals/caocao/skin2/death.mp3', 'skin2 未配阵亡语音走默认');
    check(general.getDeathAudio('skin1') === 'g/caocao/skin1/death.mp3', 'skin1 配阵亡语音取自定义');

    general.setSkin('skin1');
    check(general.getImage() === 'g/caocao/skin1/image.png', 'setSkin 切换后默认取新皮肤');
    check(general.getDeathAudio() === 'g/caocao/skin1/death.mp3', 'setSkin 后阵亡语音随新皮肤');
    general.setSkin('skin2');
    check(general.getImage() === 'g/caocao/skin2/image.png', 'setSkin 切回后默认取原皮肤');

    // 未注册武将 → 默认路径
    const other = new General(room, GeneralBuilder('liubei').build());
    check(other.getImage() === 'generals/liubei/default/image.png', '未注册武将插画走默认');
}

// ===== 4. defaultSkin 透传（builder 与 General()） =====

{
    const b = GeneralBuilder('caocao').defaultSkin('skin2').build();
    check(b.defaultSkin === 'skin2', 'GeneralBuilder.defaultSkin 显式设置');
    check(GeneralBuilder('caocao').build().defaultSkin === 'default', 'GeneralBuilder.defaultSkin 缺省 default');
    const direct: GeneralData = { name: 'caocao', kingdom: 'wei', hp: 4, gender: Gender.Male, skills: [], lord: false, enable: true, hidden: false, isWars: false, defaultSkin: 'skin2' };
    check(direct.defaultSkin === 'skin2', 'GeneralData 直接携带 defaultSkin');
}

// ===== 5. 双 map（info 按武将全名 / 皮肤按真名）+ 翻译表 =====

{
    check(sgs.generalInfoMap.get('standard.caocao')?.id === 'WEI001', 'generalInfoMap 按武将全名存储（编号）');
    check(sgs.generalInfoMap.get('standard.caocao')?.title === '魏武帝', 'generalInfoMap 按武将全名存储（称号）');
    check(sgs.generalSkinMap.get('caocao')?.length === 2, 'generalSkinMap 按武将真名存储（2 个皮肤）');
    check(sgs.getTranslation('general.standard.caocao.id') === 'WEI001', '编号 id 注入翻译表（按武将名）');
    check(sgs.getTranslation('general.standard.caocao.title') === '魏武帝', '称号 title 注入翻译表（按武将名）');
    check(sgs.getTranslation('general.standard.caocao.prefix') === '界', '前缀 prefix 注入翻译表（按武将名）');
    check(sgs.getTranslation('general.standard.caocao.designer') === '设计师', '设计师 designer 注入翻译表（按武将名）');
    check(sgs.getTranslation('general.caocao.skin1.death') === '曹操皮肤1阵亡台词', '阵亡台词写入翻译表');
    check(sgs.getTranslation('skill.caocao.skin2.jianxiong1') === '皮肤2奸雄语音2', '语音文字写入翻译表（{真名}.{皮肤}.{技能真名}{序号} 键）');
    check(sgs.getTranslation('skill.standard.caocao.jianxiong.name') === '奸雄', '技能名翻译写入翻译表');
    check(sgs.getTranslation('skill.standard.caocao.jianxiong.desc') === '标准描述', '标准描述写入翻译表');
    check(sgs.getTranslation('skill.standard.caocao.jianxiong.desc2') === '规则集描述', '规则集描述写入翻译表');

    // 重复注册：皮肤 push 且同名去重，不覆盖
    sgs.registerGeneralAssets({
        caocao: {
            skins: [
                { name: 'skin2', image: 'overwrite.png' },
                { name: 'skin3', image: 'g/caocao/skin3/image.png' },
            ],
        },
    });
    const skins = sgs.generalSkinMap.get('caocao');
    check(skins?.length === 3, '重复注册 push 新皮肤（3 个）');
    check(skins?.find((s) => s.name === 'skin2')?.image === 'g/caocao/skin2/image.png', '同名皮肤去重（不覆盖原配置）');
    check(skins?.find((s) => s.name === 'skin3')?.image === 'g/caocao/skin3/image.png', '新增 skin3 皮肤');
}

// ===== 6. Builder.assets 集成 + 注册武将时一并注册资源 =====

{
    const config = {
        name: 'standard.caocao',
        info: { id: 'WEI100', title: '魏武帝·测试' },
        skills: { 'standard.caocao.jianxiong': { lang_name: '奸雄' } },
        skins: [{ name: 'skin4', image: 'g/caocao/skin4/image.png' }],
    };
    const data = GeneralBuilder('standard.caocao').config(config).build();
    check(data.config === config, 'GeneralBuilder.config 透传到 GeneralData');
    const direct: GeneralData = { name: 'standard.caocao', kingdom: 'wei', hp: 4, gender: Gender.Male, skills: [], lord: false, enable: true, hidden: false, isWars: false, config };
    check(direct.config?.info?.title === '魏武帝·测试', 'GeneralData 直接携带 config');

    // 注册武将包：一并注册 info/皮肤
    sgs.registerGeneralPack('test-pack', [direct]);
    check(sgs.generalInfoMap.get('standard.caocao')?.id === 'WEI100', 'registerGeneralPack 一并注册 info（按武将全名）');
    check(sgs.generalSkinMap.get('caocao')?.some((s) => s.name === 'skin4') === true, 'registerGeneralPack 一并注册皮肤（按真名 push）');
}

console.log(`\n失败: ${failed}`);
