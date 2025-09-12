import { EventTriggers } from '../../../../core/event/triggers';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';

export const wenyang = sgs.General({
    name: 'xl.wenyang',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const danxiong = sgs.Skill({
    name: 'xl.wenyang.danxiong',
});

danxiong.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const juedou = room.createVirtualCardByNone(
                        'juedou',
                        undefined,
                        false
                    );
                    juedou.custom.method = 1;
                    const color = context.color;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color !== color;
                                },
                                onChange(type, item) {
                                    if (type === 'add') juedou.addSubCard(item);
                                    if (type === 'remove')
                                        juedou.delSubCard(item);
                                    juedou.set();
                                    this._use_or_play_vcard = juedou;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `胆雄，你可以将一张不为${sgs.getTranslation(
                                'color' + color
                            )}的手牌当【决斗】使用`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: NeedUseCardData) {
            if (
                this.isOwner(player) &&
                data.from === player &&
                data.has('juedou')
            ) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(player, Phase.Play)) return false;
                const last_use = room.getLastOneHistory(
                    sgs.DataType.UseCardEvent,
                    (v) => v.from === player,
                    phase
                );
                if (
                    last_use &&
                    last_use.card &&
                    !last_use.card.transform &&
                    last_use.data.subcards &&
                    last_use.data.subcards.length === 1
                )
                    return true;
                const last_usetocard = room.getLastOneHistory(
                    sgs.DataType.UseCardToCardEvent,
                    (v) => v.from === player,
                    phase
                );
                if (
                    last_usetocard &&
                    last_usetocard.card &&
                    !last_usetocard.card.transform &&
                    last_usetocard.data.subcards &&
                    last_usetocard.data.subcards.length === 1
                )
                    return true;
                return false;
            }
        },
        context(room, player, data: NeedUseCardData) {
            const phase = room.getCurrentPhase();
            const last_use = room.getLastOneHistory(
                sgs.DataType.UseCardEvent,
                (v) =>
                    v.from === player &&
                    v.card &&
                    !v.card.transform &&
                    v.data.subcards &&
                    v.data.subcards.length === 1,
                phase
            );
            if (last_use) {
                return {
                    color: last_use.card.color,
                };
            }
            const last_usetocard = room.getLastOneHistory(
                sgs.DataType.UseCardToCardEvent,
                (v) =>
                    v.from === player &&
                    v.card &&
                    !v.card.transform &&
                    v.data.subcards &&
                    v.data.subcards.length === 1,
                phase
            );
            if (last_usetocard) {
                return {
                    color: last_usetocard.card.color,
                };
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

wenyang.addSkill(danxiong);
