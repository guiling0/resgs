import {
    CardSubType,
    CardType,
    VirtualCardData,
} from '../../../../core/card/card.types';
import { VirtualCard } from '../../../../core/card/vcard';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import {
    NeedUseCardData,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';

export const xunyou = sgs.General({
    name: 'wars.xunyou',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qice = sgs.Skill({
    name: 'wars.xunyou.qice',
});

qice.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            if (this.isOwner(player) && player.hasHandCards()) {
                const canuses = room.cardNamesToSubType
                    .get(CardSubType.InstantScroll)
                    .filter((v) => v !== 'wuxiekeji' && data.has(v, 0));
                if (canuses.length === 0) return false;
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 1;
            }
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const handes = from.getHandCards();
                    const canuses = context.canuses as {
                        name: string;
                        method?: number;
                    }[];
                    let vcards: VirtualCard[] = [];
                    room.cardNamesToSubType
                        .get(CardSubType.InstantScroll)
                        .forEach((v) => {
                            if (
                                v !== 'wuxiekeji' &&
                                canuses.find((c) => c.name === v)
                            ) {
                                vcards.push(
                                    room.createVirtualCard(
                                        v,
                                        handes,
                                        undefined,
                                        true,
                                        false
                                    )
                                );
                            }
                        });
                    vcards.forEach((v) => {
                        v.custom.method = 1;
                        v.custom.canuse = from.canUseCard(
                            v,
                            undefined,
                            this.name,
                            { excluesToCard: true }
                        );
                    });
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: vcards.map((v) => v.vdata),
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
                            target: room.createChoosePlayer({
                                canConfirm: (selected) => {
                                    return (
                                        selected.length <=
                                        from.getHandCards().length
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `奇策，你可以将所有手牌当任意普通锦囊牌（目标数不能大于你的手牌数）`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('qice.delay', from);
            effect.setData('reason', this);
        },
    })
);

export const qice_delay = sgs.TriggerEffect({
    name: 'qice.delay',
    trigger: EventTriggers.UseCardEnd3,
    can_trigger(room, player, data: UseCardEvent) {
        return this.isOwner(player) && this.getData('reason') === data.skill;
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.chooseYesOrNo(
            from,
            {
                prompt: '@qice',
                thinkPrompt: this.name,
            },
            async () => {
                await room.change({
                    player: from,
                    general: 'deputy',
                    source: data,
                    reason: this.name,
                });
            }
        );
        await this.removeSelf();
        return true;
    },
});

export const zhiyu = sgs.Skill({
    name: 'wars.xunyou.zhiyu',
});

zhiyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && player === data.to;
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `智愚：请弃置一张手牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: DamageEvent, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: DamageEvent, context) {
            const { from } = context;
            const cards = from.getHandCards();
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            if (
                data.from &&
                data.from.hasCanDropCards('h', data.from, 1, this.name) &&
                cards.length &&
                cards.every((v) => v.color === cards[0].color)
            ) {
                context.targets = [data.from];
                const req = await room.doRequest({
                    player: data.from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: data.from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

xunyou.addSkill(qice);
xunyou.addSkill(zhiyu);

sgs.loadTranslation({
    ['@qice']: '奇策：是否变更',
});
