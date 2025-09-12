import { CardColor } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PlayCardEvent } from '../../../../../core/event/types/event.play';
import {
    UseCardEvent,
    UseEvent,
} from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { GameRoom } from '../../../../../core/room/room';
import {
    TriggerEffectContext,
    PriorityType,
} from '../../../../../core/skill/skill.types';

function checkLiubeiLevel(room: GameRoom) {
    const wuhu = room.getEffect(room.getMark<number>('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}

export const zhaoyun = sgs.General({
    name: 'wars.zhaoyun',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const longdan = sgs.Skill({
    name: 'wars.zhaoyun.longdan',
});

function longdan_shan_choose(room: GameRoom, context: TriggerEffectContext) {
    const from = context.from;
    const shan = room.createVirtualCardByNone('shan', undefined, false);
    shan.custom.method = 1;
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: from.getHandCards(),
                filter(item, selected) {
                    return item.name === 'sha';
                },
                onChange(type, item) {
                    if (type === 'add') shan.addSubCard(item);
                    if (type === 'remove') shan.delSubCard(item);
                    shan.set();
                    this._use_or_play_vcard = shan;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '龙胆：你可以将一张【杀】当【闪】',
        },
    };
}

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return longdan_shan_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedPlayCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return longdan_shan_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

function longdan_sha_choose(room: GameRoom, context: TriggerEffectContext) {
    const from = context.from;
    const sha = room.createVirtualCardByNone('sha', undefined, false);
    sha.custom.method = 1;
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: from.getHandCards(),
                filter(item, selected) {
                    return item.name === 'shan';
                },
                onChange(type, item) {
                    if (type === 'add') sha.addSubCard(item);
                    if (type === 'remove') sha.delSubCard(item);
                    sha.set({ attr: [] });
                    this._use_or_play_vcard = sha;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '龙胆：你可以将一张【闪】当【杀】',
        },
    };
}

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return longdan_sha_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('sha');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedPlayCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return longdan_sha_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === player && data.has('sha');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.BeOffset,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.card &&
                data.card.name === 'sha' &&
                data.current &&
                data.current.offset
            ) {
                const offset = data.current.offset;
                if (
                    offset.is(sgs.DataType.UseCardToCardEvent) &&
                    offset.card &&
                    offset.card.name === 'shan'
                ) {
                    if (player === data.from) {
                        return data.skill?.skill === this.skill;
                    }
                    if (player === data.current.target) {
                        return offset.skill?.skill === this.skill;
                    }
                }
            }
        },
        context(room, player, data: UseCardEvent) {
            if (player === data.from) {
                return {
                    type: 1,
                    targets: [data.current.target],
                };
            }
            if (player === data.current.target) {
                return {
                    type: 2,
                    targets: [data.from],
                };
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const targets = context.targets;
                    const type = context.type;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        !targets.includes(item) &&
                                        (type === 1 ? true : item !== from)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `龙胆：你可以选择另一名角色，对他${
                                type === 1 ? '造成1点伤害' : '回复1点体力'
                            }`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
                type,
            } = context;
            if (type === 1) {
                return await room.damage({
                    from,
                    to,
                    source: data,
                    reason: this.name,
                });
            } else {
                return await room.recoverhp({
                    player: to,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

longdan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: [EventTriggers.CardBeUse, EventTriggers.CardBePlay],
        can_trigger(room, player, data: UseEvent | PlayCardEvent) {
            if (
                this.isOwner(player) &&
                data.from === player &&
                checkLiubeiLevel(room) &&
                data.card &&
                this.skill
            ) {
                return this.skill.effects.includes(data.card.transform);
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

zhaoyun.addSkill(longdan);
