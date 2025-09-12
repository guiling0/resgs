"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luanji_delay = exports.luanji = exports.yuanshao = void 0;
exports.yuanshao = sgs.General({
    name: 'wars.yuanshao',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.luanji = sgs.Skill({
    name: 'wars.yuanshao.luanji',
});
exports.luanji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const wanjianqifa = room.createVirtualCardByNone('wanjianqifa', undefined, false);
                wanjianqifa.custom.method = 1;
                const suits = from.getMark(this.name) ?? [];
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 2,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return !suits.includes(item.suit);
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    wanjianqifa.addSubCard(item);
                                if (type === 'remove')
                                    wanjianqifa.delSubCard(item);
                                wanjianqifa.set();
                                this._use_or_play_vcard = wanjianqifa;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `乱击：你可以将两张手牌当【万箭齐发】使用`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('wanjianqifa'));
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        const mark = from.getMark(this.name) ?? [];
        cards.forEach((v) => {
            if (!mark.includes(v.suit)) {
                mark.push(v.suit);
            }
        });
        from.setMark(this.name, mark, {
            visible: true,
            type: '[suit]',
        });
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('luanji.delay', from);
        effect.setData('skill', this);
        effect.setData('data', data);
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                this.player.removeMark(this.name);
            },
        },
    ],
}));
exports.luanji_delay = sgs.TriggerEffect({
    name: 'luanji.delay',
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayCardEnd" /* EventTriggers.PlayCardEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from &&
            data.from.alive &&
            data.reason === 'wanjianqifa' &&
            data.source.is(sgs.DataType.UseCardEvent) &&
            data.source.skill === this.getData('skill') &&
            room.sameAsKingdom(data.from, player));
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.chooseYesOrNo(target, {
            prompt: `@luanji`,
            thinkPrompt: this.name,
        }, async () => {
            await room.drawCards({
                player: target,
                source: data,
                reason: this.name,
            });
        });
    },
    lifecycle: [
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.yuanshao.addSkill(exports.luanji);
sgs.loadTranslation({
    [exports.luanji_delay.name]: '乱击',
    ['@luanji']: '乱击：是否摸一张牌',
});
