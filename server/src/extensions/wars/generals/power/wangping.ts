import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { SkillTag } from '../../../../core/skill/skill.types';

export const wangping = sgs.General({
    name: 'wars.wangping',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const jianglue = sgs.Skill({
    name: 'wars.wangping.jianglue',
});

jianglue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Limit],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `将略：你可以选择一个军令，让所有与你势力相同的角色选择是否执行`,
                    });
                },
                choose_command: () => {
                    const commands = context.commands;
                    return {
                        selectors: {
                            command: room.createChooseCommand({
                                step: 1,
                                count: 1,
                                selectable: commands,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `将略：请选择一个军令`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.chooseCommand(from, undefined, {
                canCancle: false,
                showMainButtons: true,
                prompt: `@jianglue`,
                thinkPrompt: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const command = context.cost as number;
            const players = room.sortResponse(
                room.getPlayerByFilter((v) => room.sameAsKingdom(from, v))
            );
            const executes: GamePlayer[] = [from];
            for (const to of players) {
                if (from === to) continue;
                const exec = await room.command({
                    from,
                    to,
                    command,
                    source: data,
                    reason: this.name,
                });
                if (exec.execute) {
                    executes.push(to);
                }
            }
            //加体力上限
            room.sortResponse(executes);
            let count = 0;
            for (const player of executes) {
                if (player.maxhp < 5) {
                    await room.changeMaxHp({
                        player,
                        source: data,
                        reason: this.name,
                    });
                }
                const recover = await room.recoverhp({
                    player,
                    source: data,
                    reason: this.name,
                });
                if (recover) count++;
            }
            //摸牌
            await room.drawCards({
                player: from,
                count,
                source: data,
                reason: this.name,
            });
        },
    })
);

wangping.addSkill('wars.wangping.jianglue');

sgs.loadTranslation({
    ['@jianglue']: '将略：请选择一个军令',
});
