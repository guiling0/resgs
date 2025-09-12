"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mowang = exports.danggu = exports.shichangshi = void 0;
exports.shichangshi = sgs.General({
    name: 'mobile.shichangshi',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
});
function jiedang_choose(room, context, reason) {
    const from = context.from;
    const head_general = room.getGeneral(context.head_general);
    const generals = room.getGenerals(context.generals);
    const cards = [];
    cards.push({ title: '主将', cards: [head_general] });
    cards.push({ title: '副将', cards: generals });
    return {
        selectors: {
            general: {
                type: 'general',
                step: 1,
                count: 1,
                selectable: generals,
                filter: function (item, selected) {
                    //TODO 实现好感度机制
                    return true;
                },
                selecte_type: 'rows',
                data_rows: cards,
                windowOptions: {
                    title: '结党',
                    timebar: 35,
                    buttons: ['confirm'],
                    prompt: '结党：请从副将里选择一张武将牌与主将组成双将',
                },
            },
        },
        options: {
            ms: 35,
            canCancle: false,
            showMainButtons: false,
            prompt: '',
            thinkPrompt: reason,
        },
    };
}
exports.danggu = sgs.Skill({
    name: 'mobile.shichangshi.danggu',
});
exports.danggu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "GameStarted" /* EventTriggers.GameStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && !room.getData('danggu');
    },
    getSelectors(room, context) {
        return {
            jiedang: () => {
                return jiedang_choose(room, context, this.name);
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const css = [
            'mobile.cs_zhangrang',
            'mobile.cs_zhaozhong',
            'mobile.cs_sunzhang',
            'mobile.cs_bilan',
            'mobile.cs_xiayun',
            'mobile.cs_hankui',
            'mobile.cs_lisong',
            'mobile.cs_duangui',
            'mobile.cs_guosheng',
            'mobile.cs_gaowang',
        ];
        const generls = css.map((v) => room.granaryArea.generals.find((g) => g.name === v));
        room.granaryArea.remove(generls);
        from.upArea.add(generls);
        generls.forEach((v) => v.setMark('mark.changshi', true));
        from.setMark('mark.changshi', true, {
            source: 'mark.changshi',
            visible: true,
            type: 'generals',
        });
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        room.setData('danggu', true);
        const generals = from.upArea.generals.filter((v) => v.hasMark('mark.changshi'));
        sgs.utils.shuffle(generals);
        context.head_general = generals.at(0).id;
        context.generals = room.getGeneralIds(generals.slice(1, 5));
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('jiedang'),
                context,
            },
        });
        const general = room
            .getResult(req, 'general')
            .result.at(0);
        if (general) {
            const head = generals.at(0);
            const deputy = general;
            head.removeMark('mark.changshi');
            deputy.removeMark('mark.changshi');
            from.refreshMark = 'mark.changshi';
            from.upArea.remove([head, deputy]);
            room.granaryArea.add([head, deputy]);
            from.setProperty('general_mode', 'dual');
            await room.change({
                player: from,
                general: 'head',
                to_general: head,
                source: data,
                reason: this.name,
            });
            await room.change({
                player: from,
                general: 'deputy',
                to_general: deputy,
                source: data,
                reason: this.name,
            });
            //重新获得党锢和殁亡
            await room.addSkill('mobile.shichangshi.danggu', from, {
                source: 'danggu',
                showui: 'default',
            });
            await room.addSkill('mobile.shichangshi.mowang', from, {
                source: 'mowang',
                showui: 'default',
            });
        }
    },
}));
exports.danggu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "RestOver" /* EventTriggers.RestOver */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.player === player &&
            !data.data.danggu &&
            player.upArea.generals.filter((v) => v.hasMark('mark.changshi'))
                .length > 0);
    },
    getSelectors(room, context) {
        return {
            jiedang: () => {
                return jiedang_choose(room, context, this.name);
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        from.changeHp(1);
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        data.data.danggu = true;
        const generals = from.upArea.generals.filter((v) => v.hasMark('mark.changshi'));
        sgs.utils.shuffle(generals);
        context.head_general = generals.at(0).id;
        context.generals = room.getGeneralIds(generals.slice(1, 5));
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('jiedang'),
                context,
            },
        });
        const general = room
            .getResult(req, 'general')
            .result.at(0);
        if (general) {
            const head = generals.at(0);
            const deputy = general;
            head.removeMark('mark.changshi');
            deputy.removeMark('mark.changshi');
            from.upArea.remove([head, deputy]);
            room.granaryArea.add([head, deputy]);
            from.refreshMark = 'mark.changshi';
            from.setProperty('general_mode', 'dual');
            await room.change({
                player: from,
                general: 'head',
                to_general: head,
                source: data,
                reason: this.name,
            });
            await room.change({
                player: from,
                general: 'deputy',
                to_general: deputy,
                source: data,
                reason: this.name,
            });
            //重新获得党锢和殁亡
            await room.addSkill('mobile.shichangshi.danggu', from, {
                source: 'danggu',
                showui: 'default',
            });
            await room.addSkill('mobile.shichangshi.mowang', from, {
                source: 'mowang',
                showui: 'default',
            });
        }
    },
}));
exports.mowang = sgs.Skill({
    name: 'mobile.shichangshi.mowang',
});
exports.mowang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "BeforeDeath" /* EventTriggers.BeforeDeath */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.player === player &&
            !data.data.mowang &&
            player.upArea.generals.filter((v) => v.hasMark('mark.changshi'))
                .length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        from.setProperty('rest', 1);
        data.data.mowang = true;
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        //播放动画
        const uses = room.getGeneralIds(from.getData('changshi_uses') ?? []);
        const news = room.getGeneralIds([from.head, from.deputy]);
        room.broadcast({
            type: 'MsgPlayGlobalAni',
            ani: 'shichangshi_skill',
            data: {
                uses,
                news,
            },
        });
        await room.delay(3.5);
        const generals = from.getData('changshi_uses') ?? [];
        generals.push(from.head, from.deputy);
        from.setData('changshi_uses', generals);
        const shichangshi = room.generals.get('mobile.shichangshi');
        if (shichangshi) {
            const danggu = room.skills.find((v) => v.name === 'mobile.shichangshi.danggu' &&
                v.player === from);
            if (danggu)
                await danggu.removeSelf();
            await this.skill.removeSelf();
            await room.change({
                player: from,
                general: 'head',
                to_general: shichangshi,
                source: data,
                reason: this.name,
            });
            await room.remove({
                player: from,
                general: from.deputy,
                source: data,
                reason: this.name,
            });
            from.setProperty('general_mode', 'single');
        }
    },
}));
exports.mowang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.die({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shichangshi.addSkill(exports.danggu);
exports.shichangshi.addSkill(exports.mowang);
sgs.loadTranslation({
    ['mark.changshi']: '常侍',
});
