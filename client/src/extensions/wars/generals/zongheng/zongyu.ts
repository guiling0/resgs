import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';

export const zongyu = sgs.General({
    name: 'wars.zongyu',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qiao = sgs.Skill({
    name: 'wars.zongyu.qiao',
});

qiao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                room.isOtherKingdom(player, data.from) &&
                data.from.hasCanDropCards('he', player, 1, this.name) &&
                data.current.target === player
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 2;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            const from = context.from;
            const target = context.targets.at(0);
            return {
                choose: () => {
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '气傲',
                                    timebar: room.responseTime,
                                    prompt: '气傲：请选择一张牌',
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
            const {
                from,
                targets: [target],
            } = context;
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
        async effect(room, data, context) {
            const { from } = context;
            if (from.hasCanDropCards('he', from, 1, this.name)) {
                context.targets = [from];
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const chengshang = sgs.Skill({
    name: 'wars.zongyu.chengshang',
});

chengshang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.UseCardEnd1,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.UseCardEvent) &&
                data.from &&
                data.from === player &&
                data.card &&
                data.card.subcards.length === 1 &&
                data.targetList.some((v) =>
                    room.isOtherKingdom(player, v.target)
                ) &&
                !this.getData(this.name)
            ) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(player, Phase.Play)) return false;
                return !room.hasHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.channel === data.card,
                    data
                );
            }
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            const cards = room.drawArea.cards.filter(
                (v) =>
                    v.suit === data.card.suit && v.number === data.card.number
            );
            const gain = await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            if (gain) {
                this.setData(this.name, true);
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.PlayPhaseEnd,
                async on_exec(room, data: PhaseEvent) {
                    if (data.isOwner(this.player)) {
                        this.removeData(this.name);
                    }
                },
            },
        ],
    })
);

zongyu.addSkill(qiao);
zongyu.addSkill(chengshang);
