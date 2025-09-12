import { EventTriggers } from '../../../../core/event/triggers';
import {
    OpenEvent,
    RemoveEvent,
} from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';

export const mifuren = sgs.General({
    name: 'wars.mifuren',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const guixiu = sgs.Skill({
    name: 'wars.mifuren.guixiu',
});

guixiu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.Opened,
        can_trigger(room, player, data: OpenEvent) {
            return (
                this.isOwner(player) &&
                data.generals.includes(this.skill?.sourceGeneral)
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);

guixiu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.StateChange,
        can_trigger(room, player, data: RemoveEvent) {
            return (
                data.is(sgs.DataType.RemoveEvent) &&
                this.isOwner(player) &&
                data.general === this.skill?.sourceGeneral
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('guixiu.delay', from);
            effect.setData('data', data);
            return true;
        },
    })
);

export const guixiu_delay = sgs.TriggerEffect({
    name: 'guixiu.delay',
    trigger: EventTriggers.StateChanged,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.recoverhp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: EventTriggers.StateChangeEnd,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const cunsi = sgs.Skill({
    name: 'wars.mifuren.cunsi',
});

cunsi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && !this.isOpen()
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `存嗣：是否明置武将牌`,
                    });
                },
            };
        },
    })
);

cunsi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && this.isOpen()
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `存嗣：你可以选择一名角色令他获得勇决`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return room.remove({
                player: from,
                general: this.skill?.sourceGeneral,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            await room.addSkill('wars.mifuren.yongjue', target, {
                source: this.name,
                showui: 'default',
            });
            target.setMark('wars.mifuren.yongjue', true, { visible: true });
            if (target !== this.player) {
                await room.drawCards({
                    player: target,
                    count: 2,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const yongjue = sgs.Skill({
    name: 'wars.mifuren.yongjue',
});

yongjue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                room.sameAsKingdom(player, data.from) &&
                data.card &&
                data.card.name === 'sha' &&
                data.card.hasSubCards()
            ) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(data.from, Phase.Play)) return false;
                const uses = room
                    .getPeriodHistory(phase)
                    .find(
                        (v) =>
                            v.data !== data &&
                            (v.data.is(sgs.DataType.UseCardEvent) ||
                                v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                            v.data.from === data.from
                    );
                return !uses;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const {
                targets: [target],
            } = context;
            await room.chooseYesOrNo(
                target,
                { prompt: '@yongjue', thinkPrompt: this.name },
                async () => {
                    await room.obtainCards({
                        player: target,
                        cards: data.card.subcards,
                        source: data,
                        reason: this.name,
                    });
                }
            );
            return true;
        },
    })
);

mifuren.addSkill(guixiu);
mifuren.addSkill(cunsi);
mifuren.addSkill('#wars.mifuren.yongjue');

sgs.loadTranslation({
    ['@yongjue']: '勇决：是否获得【杀】',
});
