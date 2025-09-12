import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const wangtaowangyue = sgs.General({
    name: 'xl.wangtaowangyue',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Female,
    isWars: true,
});

export const shuying = sgs.Skill({
    name: 'xl.wangtaowangyue.shuying',
});

shuying.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Regard_ArrayCondition](from, to, type) {
            if (
                type === 'quene' &&
                this.player &&
                this.isOwner(from) &&
                to === this.player
            ) {
                return true;
            }
        },
        [StateEffectType.Range_Correct](from) {
            if (this.isOwner(from)) {
                return 1;
            }
        },
        [StateEffectType.MaxHand_Correct](from) {
            if (this.isOwner(from)) {
                return 1;
            }
        },
    })
);

export const huyi = sgs.Skill({
    name: 'xl.wangtaowangyue.huyi',
});

huyi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Array_Quene],
        forced: 'cost',
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseCardEvent) {
            if (this.isOwner(player) && data.card && data.card.name === 'sha') {
                const quene = room.getQueue(player);
                if (quene.includes(data.from)) {
                    room.sortPlayers(quene);
                    const prev = quene.at(0).prev;
                    const next = quene.at(-1).next;
                    if (
                        data.targets.includes(prev) ||
                        data.targets.includes(next)
                    ) {
                        const uses = room.getHistorys(
                            sgs.DataType.UseSkillEvent,
                            (v) => v.use_skill === this,
                            room.currentTurn
                        );
                        return uses.length < 1;
                    }
                }
            }
        },
        context(room, player, data: UseCardEvent) {
            const quene = room.getQueue(player);
            const targets: GamePlayer[] = [];
            if (quene.includes(data.from)) {
                room.sortPlayers(quene);
                const prev = quene.at(0).prev;
                const next = quene.at(-1).next;
                if (data.targets.includes(prev)) {
                    targets.push(next);
                }
                if (data.targets.includes(next)) {
                    targets.push(prev);
                }
            }
            return {
                targets: targets,
            };
        },
        getSelectors(room, context) {
            const targets = context.targets;
            return {
                target: () => {
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                filter(item, selected) {
                                    return selected.length === 0
                                        ? targets.includes(item)
                                        : true;
                                },
                                excluesCardTimesLimit: true,
                            }),
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.needUseCard({
                from,
                cards: [{ name: 'sha' }],
                targetSelector: {
                    selectorId: this.getSelectorName('target'),
                    context,
                },
                reqOptions: {
                    canCancle: true,
                    prompt: `@huyi`,
                    thinkPrompt: this.name,
                },
                source: data,
                reason: this.name,
            });
        },
    })
);

wangtaowangyue.addSkill(shuying);
wangtaowangyue.addSkill(huyi);

sgs.loadTranslation({
    ['@huyi']: '虎翼：你可以使用一张【杀】',
});
