import { CardPut, EquipSubType } from '../../../../core/card/card.types';
import { CardUseSkillData } from '../../../../core/card/card.use';
import { EventTriggers } from '../../../../core/event/triggers';
import { CommandData } from '../../../../core/event/types/event.command';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import {
    NeedUseCardData,
    TargetCardListItem,
    TargetListItem,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { GameRoom } from '../../../../core/room/room';
import { TriggerEffect } from '../../../../core/skill/effect';
import { PriorityType } from '../../../../core/skill/skill.types';

export const sunxiu_jin = sgs.General({
    name: 'wars.sunxiu_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const xiejian = sgs.Skill({
    name: 'wars.sunxiu_jin.xiejian',
});

xiejian.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
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
                            prompt: `挟奸：你可以选择一名其他角色，对他发起军令`,
                            thinkPrompt: '挟奸',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player, Phase.Play);
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            return await room.command({
                from,
                to,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            const command = context.cost as CommandData;
            if (!command.execute) {
                const c = command.selectable.find((v) => v !== command.command);
                //展示军令
                room.broadcast({
                    type: 'MsgPlayCardMoveAni',
                    data: [
                        {
                            cards: [c],
                            fromArea: from.handArea.areaId,
                            toArea: room.processingArea.areaId,
                            movetype: CardPut.Up,
                            puttype: CardPut.Up,
                            animation: true,
                            moveVisibles: [],
                            cardVisibles: [],
                            isMove: false,
                            label: {
                                text: '{0}{1}',
                                values: [
                                    { type: 'player', value: from.playerId },
                                    { type: 'string', value: this.name },
                                ],
                            },
                        },
                    ],
                });
                await room.delay(1);
                //直接执行军令
                await room.command({
                    from,
                    to,
                    command: c,
                    execute: true,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const yinsha = sgs.Skill({
    name: 'wars.sunxiu_jin.yinsha',
});

async function effect(
    this: CardUseSkillData,
    room: GameRoom,
    target: TargetListItem,
    data: UseCardEvent
) {
    const { from, card, current, baseDamage = 1, cantResponse } = data;
    const s = room.getData<TriggerEffect>('jiedaosharen_choose');
    const cards = [
        {
            name: 'sha',
            method: 1,
        },
    ];
    if (cantResponse.includes(current.target)) {
        cards.length = 0;
    }
    let use = await room.needUseCard({
        from: current.target,
        cards,
        targetSelector: {
            selectorId: s.getSelectorName('target'),
            context: {
                targets: current.subTargets,
            },
        },
        source: data,
        reason: this.name,
        reqOptions: {
            canCancle: true,
            prompt: {
                text: 'jiedaosharen_response',
                values: [
                    {
                        type: 'player',
                        value: current.subTargets.at(0)?.playerId,
                    },
                    { type: 'player', value: from.playerId },
                ],
            },
            thinkPrompt: 'jiedaosharen',
        },
    });
    if (!use && current.target.hasHandCards()) {
        const card = room.createVirtualCard(
            'sha',
            current.target.getHandCards(),
            undefined,
            true
        );
        card.custom.method = 1;
        if (
            current.target.canUseCard(
                card,
                undefined,
                this.name,
                room.createChoosePlayer({
                    filter(item, selected) {
                        return selected.length === 0
                            ? current.subTargets.includes(item)
                            : true;
                    },
                })
            )
        )
            use = await room.preUseCard({
                from: current.target,
                card,
                targetSelector: {
                    selectorId: s.getSelectorName('target'),
                    context: {
                        targets: current.subTargets,
                    },
                },
                source: data,
                reason: this.name,
                reqOptions: {
                    canCancle: false,
                    prompt: {
                        text: 'jiedaosharen_response',
                        values: [
                            {
                                type: 'player',
                                value: current.subTargets.at(0)?.playerId,
                            },
                            { type: 'player', value: from.playerId },
                        ],
                    },
                    thinkPrompt: 'jiedaosharen',
                },
            });
    }
    const wuqi = current.target.getEquip(EquipSubType.Weapon);
    if (!use && wuqi) {
        await room.giveCards({
            from: current.target,
            to: from,
            cards: [wuqi],
            source: data,
            reason: this.name,
        });
    }
}

yinsha.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                player.hasHandCards() &&
                data.has('jiedaosharen')
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effect = context.effect;
                    const from = context.from;
                    const handes = from.getHandCards();
                    const jiedaosharen = room.createVirtualCard(
                        'jiedaosharen',
                        handes,
                        undefined,
                        true,
                        false
                    );
                    jiedaosharen.custom.method = 1;
                    jiedaosharen.custom.canuse = from.canUseCard(
                        jiedaosharen,
                        undefined,
                        effect.name
                    );
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [jiedaosharen.vdata],
                                filter(item, selected) {
                                    return item.custom.canuse;
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `引杀，你可以将所有手牌当【借刀杀人】使用（目标必须使用【杀】，若没有【杀】，则需要将全部手牌当【杀】）`,
                            thinkPrompt: `引杀`,
                        },
                    };
                },
            };
        },
        async effect(room, data: UseCardEvent, context) {
            data.effect = effect;
        },
    })
);

sunxiu_jin.addSkill(xiejian);
sunxiu_jin.addSkill(yinsha);
