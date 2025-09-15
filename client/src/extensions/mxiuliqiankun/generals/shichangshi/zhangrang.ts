import { GameCard } from '../../../../core/card/card';
import { CardSubType, CardType } from '../../../../core/card/card.types';
import { VirtualCard } from '../../../../core/card/vcard';
import { EventTriggers } from '../../../../core/event/triggers';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';

export const cs_zhangrang = sgs.General({
    name: 'cs_zhangrang',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const taoluan = sgs.Skill({
    name: 'cs_zhangrang.taoluan',
});

taoluan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard2,
        can_trigger(room, player, data: NeedUseCardData) {
            if (this.isOwner(player) && player.hasHandCards()) {
                const canuses = [
                    ...room.cardNamesToType.get(CardType.Basic),
                    ...room.cardNamesToSubType.get(CardSubType.InstantScroll),
                ].filter((v) => data.has(v, 0));
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
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    const canuses = context.canuses as {
                        name: string;
                        method?: number;
                    }[];
                    let vcards: VirtualCard[] = [];
                    [
                        ...room.cardNamesToType.get(CardType.Basic),
                        ...room.cardNamesToSubType.get(
                            CardSubType.InstantScroll
                        ),
                    ].forEach((v) => {
                        if (canuses.find((c) => c.name === v)) {
                            vcards.push(
                                room.createVirtualCard(
                                    v,
                                    [],
                                    undefined,
                                    true,
                                    false
                                )
                            );
                        }
                    });
                    vcards.forEach((v, i) => {
                        v.custom.method = 1;
                        v.custom.canuse = from.canUseCard(
                            v,
                            undefined,
                            this.name
                        );
                    });
                    return {
                        selectors: {
                            vcard: room.createChooseVCard({
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
                                        this._use_or_play_vcard.clearSubCard();
                                        this._use_or_play_vcard.addSubCard(
                                            this.selectors.card
                                                .result as GameCard[]
                                        );
                                        this._use_or_play_vcard.set();
                                    }
                                },
                            }),
                            card: room.createChooseCard({
                                step: 2,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `滔乱，你可以将一张牌当任意基本牌或普通锦囊牌使用`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
    })
);

cs_zhangrang.addSkill(taoluan);
