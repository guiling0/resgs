import { CardSuit } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PlayCardEvent } from '../../../../../core/event/types/event.play';
import { Gender } from '../../../../../core/general/general.type';

export const yuanshao = sgs.General({
    name: 'wars.yuanshao',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const luanji = sgs.Skill({
    name: 'wars.yuanshao.luanji',
});

luanji.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const wanjianqifa = room.createVirtualCardByNone(
                        'wanjianqifa',
                        undefined,
                        false
                    );
                    wanjianqifa.custom.method = 1;
                    const suits = from.getMark<CardSuit[]>(this.name) ?? [];
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
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('wanjianqifa')
            );
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            const mark = from.getMark<CardSuit[]>(this.name) ?? [];
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
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    this.player.removeMark(this.name);
                },
            },
        ],
    })
);

export const luanji_delay = sgs.TriggerEffect({
    name: 'luanji.delay',
    auto_log: 1,
    auto_directline: 1,
    trigger: EventTriggers.PlayCardEnd,
    can_trigger(room, player, data: PlayCardEvent) {
        return (
            this.isOwner(player) &&
            data.from &&
            data.from.alive &&
            data.reason === 'wanjianqifa' &&
            data.source.is(sgs.DataType.UseCardEvent) &&
            data.source.skill === this.getData('skill') &&
            room.sameAsKingdom(data.from, player)
        );
    },
    context(room, player, data: PlayCardEvent) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const {
            targets: [target],
        } = context;
        return await room.chooseYesOrNo(
            target,
            {
                prompt: `@luanji`,
                thinkPrompt: this.name,
            },
            async () => {
                await room.drawCards({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.UseCardEnd3,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

yuanshao.addSkill(luanji);

sgs.loadTranslation({
    [luanji_delay.name]: '乱击',
    ['@luanji']: '乱击：是否摸一张牌',
});
