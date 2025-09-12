import {
    CardColor,
    CardSuit,
    CardType,
} from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import {
    UseCardEvent,
    UseCardToCardEvent,
} from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const lvmeng = sgs.General({
    name: 'wars.lvmeng',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const keji = sgs.Skill({
    name: 'wars.lvmeng.keji',
});

keji.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.DropPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const uses: (UseCardEvent | UseCardToCardEvent)[] = [];
                room.getHistorys(
                    sgs.DataType.PhaseEvent,
                    (v) => v.isOwner(player, Phase.Play),
                    room.currentTurn
                ).forEach((v) => {
                    uses.push(
                        ...room.getHistorys(
                            sgs.DataType.UseCardEvent,
                            (d) => d.from === player,
                            v
                        )
                    );
                    uses.push(
                        ...room.getHistorys(
                            sgs.DataType.UseCardToCardEvent,
                            (d) => d.from === player,
                            v
                        )
                    );
                });
                return !uses.find((v1) =>
                    uses.find(
                        (v2) =>
                            v1.card.color !== CardColor.None &&
                            v2.card.color !== CardColor.None &&
                            v1.card.color !== v2.card.color
                    )
                );
            }
        },
        async cost(room, data, context) {
            context.from.setMark(this.name, true);
            return true;
        },
        lifecycle: [
            {
                trigger: EventTriggers.DropPhaseEnd,
                priority: 'after',
                async on_exec(room, data) {
                    this.player.removeMark(this.name);
                },
            },
        ],
    })
);

keji.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.MaxHand_Correct](from) {
            if (this.isOwner(from) && from.hasMark(this.name)) {
                return 4;
            }
        },
    })
);

export const mouduan = sgs.Skill({
    name: 'wars.lvmeng.mouduan',
});

mouduan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const uses: (UseCardEvent | UseCardToCardEvent)[] = [];
                room.getHistorys(
                    sgs.DataType.PhaseEvent,
                    (v) => v.isOwner(player, Phase.Play),
                    room.currentTurn
                ).forEach((v) => {
                    uses.push(
                        ...room.getHistorys(
                            sgs.DataType.UseCardEvent,
                            (d) => d.from === player,
                            v
                        )
                    );
                    uses.push(
                        ...room.getHistorys(
                            sgs.DataType.UseCardToCardEvent,
                            (d) => d.from === player,
                            v
                        )
                    );
                });
                if (uses.length < 3) return false;
                const suits: CardSuit[] = [];
                const types: CardType[] = [];
                uses.forEach((v) => {
                    if (
                        !suits.includes(v.card.suit) &&
                        v.card.suit !== CardSuit.None
                    )
                        suits.push(v.card.suit);
                    if (
                        !types.includes(v.card.type) &&
                        v.card.type !== CardType.None
                    )
                        types.push(v.card.type);
                });
                return suits.length === 4 || types.length === 3;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            await room.moveFiled(
                from,
                'ej',
                {
                    canCancle: true,
                    showMainButtons: true,
                    prompt: this.name,
                },
                data,
                this.name
            );
        },
    })
);

lvmeng.addSkill(keji);
lvmeng.addSkill(mouduan);
