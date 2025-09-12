import { EventTriggers } from '../../../../../core/event/triggers';
import {
    DieEvent,
    DyingEvent,
} from '../../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../../core/event/types/event.move';
import { Gender } from '../../../../../core/general/general.type';
import { SkillTag } from '../../../../../core/skill/skill.types';

export const tianfeng = sgs.General({
    name: 'wars.tianfeng',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const sijian = sgs.Skill({
    name: 'wars.tianfeng.sijian',
});

sijian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_lose(player, 'h') &&
                !player.hasHandCards()
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const self = this;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        item.hasCanDropCards(
                                            'he',
                                            from,
                                            1,
                                            self.name
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `死谏：你可以弃置一名其他角色的一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '死谏',
                                    timebar: room.responseTime,
                                    prompt: '死谏：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const suishi = sgs.Skill({
    name: 'wars.tianfeng.suishi',
});

suishi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: ['tianfeng/suishi1'],
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player !== player &&
                room.sameAsKingdom(player, data.player)
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

suishi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: ['tianfeng/suishi2'],
        trigger: EventTriggers.EntryDying,
        can_trigger(room, player, data: DyingEvent) {
            if (this.isOwner(player) && data.player !== player) {
                const damage = data.getDamage();
                return (
                    damage &&
                    damage.from &&
                    room.sameAsKingdom(player, damage.from)
                );
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

tianfeng.addSkill(sijian);
tianfeng.addSkill(suishi);

export const tianfeng_v2025 = sgs.General({
    name: 'wars.v2025.tianfeng',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const suishi_v2025 = sgs.Skill({
    name: 'wars.v2025.tianfeng.suishi',
});

suishi_v2025.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: ['tianfeng/suishi1'],
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player !== player &&
                room.sameAsKingdom(player, data.player)
            );
        },
        getSelectors(room, context) {
            return {
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
                            prompt: '随势：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const losehp = room.createEventData(sgs.DataType.LoseHpEvent, {
                player: from,
                source: data,
                reason: this.name,
            });
            const handles: string[] = ['suishi.losehp', 'suishi.dropcard'];
            if (!losehp.check()) {
                handles[0] = '!' + handles[0];
            }
            if (!from.hasCanDropCards('h', from, 1, this.name)) {
                handles[1] = '!' + handles[1];
            }
            if (handles.every((v) => v.at(0) === '!')) {
                return false;
            }
            context.handles = handles;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context: {
                        handles,
                    },
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('suishi.losehp')) {
                await room.losehp(losehp);
            }
            if (result.includes('suishi.dropcard')) {
                await room.dropCards({
                    player: from,
                    cards: from.getHandCards(),
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

suishi_v2025.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: ['tianfeng/suishi2'],
        trigger: EventTriggers.EntryDying,
        can_trigger(room, player, data: DyingEvent) {
            if (this.isOwner(player) && data.player !== player) {
                const damage = data.getDamage();
                return (
                    damage &&
                    damage.from &&
                    room.sameAsKingdom(player, damage.from)
                );
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

tianfeng_v2025.addSkill(sijian);
tianfeng_v2025.addSkill(suishi_v2025);

sgs.loadTranslation({
    ['suishi.losehp']: '失去体力',
    ['suishi.dropcard']: '弃置所有手牌',
});
