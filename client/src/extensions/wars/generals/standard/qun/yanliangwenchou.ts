import { CardColor } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';

export const yanliangwenchou = sgs.General({
    name: 'wars.yanliangwenchou',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const shuangxiong = sgs.Skill({
    name: 'wars.yanliangwenchou.shuangxiong',
});

shuangxiong.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStartedAfter,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                data.ratedDrawnum > 0
            );
        },
        async cost(room, data: PhaseEvent, context) {
            await data.end();
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const judge = await room.judge({
                player: from,
                isSucc(result) {
                    return true;
                },
                source: data,
                reason: this.name,
            });
            if (!judge || !judge.result) return;
            let color = CardColor.None;
            if (judge.result.color === CardColor.Black) color = CardColor.Red;
            if (judge.result.color === CardColor.Red) color = CardColor.Black;
            from.setMark(this.name, `color${color}`, {
                visible: true,
            });
            from.setMark('wars.ss', color);
            await room.obtainCards({
                player: from,
                cards: [judge.card],
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    this.player.removeMark(this.name);
                    this.player.removeMark('wars.ss');
                },
            },
        ],
    })
);

shuangxiong.addEffect(
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
                    const color = from.getMark<CardColor>('wars.ss');
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color === color;
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
                            prompt: `双雄，你可以将一张${sgs.getTranslation(
                                'color' + color
                            )}手牌当【决斗】使用`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('juedou') &&
                player.hasMark('wars.ss')
            );
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

yanliangwenchou.addSkill(shuangxiong);
