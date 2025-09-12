import { AreaType } from '../../../../core/area/area.type';
import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent } from '../../../../core/event/types/event.die';
import { PindianEvent } from '../../../../core/event/types/event.pindian';
import { TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const luji_jin = sgs.General({
    name: 'xl.luji_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qinggang = sgs.Skill({
    name: 'xl.luji_jin.qinggang',
});

qinggang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from !== player &&
                data.targetCount === 1 &&
                data.current.target &&
                data.current.target === player &&
                player.canPindian([data.from], this.name)
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.pindian({
                from,
                targets: [target],
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `@qinggang`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data: UseCardEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from) {
                await data.invalidCurrent();
            }
            if (pindian.lose.includes(from)) {
                await data.targetCantResponse([from]);
            }
        },
    })
);

qinggang.addEffect(
    sgs.StateEffect({
        [StateEffectType.Regard_PindianResult](cards, reason) {
            if (cards.get(this.player)) {
                const pindian_cards = [...cards.values()];
                const length1 =
                    sgs.getTranslation(pindian_cards[0]?.name)?.length ?? 0;
                const length2 =
                    sgs.getTranslation(pindian_cards[1]?.name)?.length ?? 0;
                if (length1 === length2) {
                    return this.player;
                }
            }
        },
    })
);

export const heli = sgs.Skill({
    name: 'xl.luji_jin.heli',
});

heli.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return this.isOwner(player) && data.player === player;
        },
        context(room, player, data: DieEvent) {
            return {
                targets: room.getPlayerByFilter(
                    (v) =>
                        v !== this.player && room.sameAsKingdom(v, this.player)
                ),
            };
        },
        async effect(room, data, context) {
            const { targets } = context;
            for (const target of targets) {
                await room.chooseYesOrNo(
                    target,
                    {
                        prompt: `@heli`,
                        thinkPrompt: this.name,
                    },
                    async () => {
                        await room.losehp({
                            player: target,
                            source: data,
                            reason: this.name,
                        });
                        await room.drawCards({
                            player: target,
                            count: 3,
                            source: data,
                            reason: this.name,
                        });
                    }
                );
            }
        },
    })
);

export const qinghe = sgs.Skill({
    name: 'xl.luji_jin.qinghe',
});

qinghe.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.TurnStarted,
        can_trigger(room, player, data: TurnEvent) {
            return (
                this.isOwner(player) &&
                data.player === player &&
                this.skill &&
                this.skill.sourceGeneral
            );
        },
        async cost(room, data, context) {
            const luyun = room.getGeneral('xl.luyun');
            if (luyun && luyun.area && luyun.area.type !== AreaType.Hand) {
                await room.change({
                    player: this.player,
                    general: this.skill.sourceGeneral,
                    to_general: luyun,
                    triggerNot: true,
                    source: data,
                    reason: this.name,
                });
                const skill = room.skills.find(
                    (v) => v.name === 'xl.luyun.pingyuan'
                );
                if (skill) {
                    skill.setInvalids('pingyuan', true);
                }
                return true;
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    if (this.skill) {
                        this.skill.setInvalids('qinghe', false);
                    }
                },
            },
        ],
    })
);

luji_jin.addSkill(qinggang);
luji_jin.addSkill(heli);
luji_jin.addSkill(qinghe);

sgs.loadTranslation({
    ['@qinggang']: '清刚：请选择一张牌拼点',
    ['@heli']: '鹤唳：是否失去1点体力并摸三张牌',
});
