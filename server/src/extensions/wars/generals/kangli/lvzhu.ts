import { CardColor, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const lvzhu = sgs.General({
    name: 'xl.lvzhu',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const jiaorao = sgs.Skill({
    name: 'xl.lvzhu.jiaorao',
});

jiaorao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from &&
                data.from !== player &&
                data.card.subtype === CardSubType.InstantScroll &&
                data.current.target === player &&
                data.card &&
                data.card.color !== CardColor.None
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                color: data.card.color,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const color = context.color as CardColor;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color === color;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `娇娆，你可以弃置一张${color}牌，取消目标中的你`,
                            thinkPrompt: '娇娆',
                        },
                    };
                },
                choose: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            prompt: '娇娆：请选择一项',
                            showMainButtons: false,
                            thinkPrompt: '娇娆',
                        },
                    };
                },
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            await data.cancleCurrent();
            const card = room.createVirtualCardByData(data.card.vdata);
            card.clearSubCard();
            const handles: string[] = ['jiaorao.use', 'jiaorao.yinyangyu'];
            if (
                !from.canUseCard(card, [data.from], this.name, {
                    excluesCardTimesLimit: true,
                    excluesCardDistanceLimit: true,
                })
            ) {
                handles[0] = '!jiaorao.use';
            }
            context.handles = handles;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('jiaorao.use')) {
                await room.usecard({
                    from,
                    card,
                    targets: [data.from],
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            }
            if (result.includes('jiaorao.yinyangyu')) {
                room.broadcast({
                    type: 'MsgPlayFaceAni',
                    ani: 'yinyangyu',
                    player: from.playerId,
                });
                await room.delay(2);
                await room.addSkill('wars.mark.yinyangyu', from, {
                    source: this.name,
                    showui: 'mark',
                });
            }
        },
    })
);

export const xianghun = sgs.Skill({
    name: 'xl.lvzhu.xianghun',
});

xianghun.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.number >= player.hp
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `香魂：你可以将你区域里的所有牌交给一名其他角色`,
                            thinkPrompt: '香魂',
                        },
                    };
                },
            };
        },
        async cost(room, data: DamageEvent, context) {
            await data.prevent();
            return true;
        },
        async effect(room, data: DamageEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            await room.giveCards({
                from,
                to: target,
                cards: from.getAreaCards(),
                source: data,
                reason: this.name,
            });
            await room.executeExtraTurn(
                room.createEventData(sgs.DataType.TurnEvent, {
                    player: target,
                    isExtra: true,
                    phases: room.getRatedPhases(),
                    skipPhases: [],
                    source: undefined,
                    reason: this.name,
                })
            );
            await room.die({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

lvzhu.addSkill(jiaorao);
lvzhu.addSkill(xianghun);

sgs.loadTranslation({
    ['jiaorao.use']: '视为使用该牌',
    ['jiaorao.yinyangyu']: '获得阴阳鱼',
});
