import {
    CardColor,
    CardPut,
    CardSubType,
    CardSuit,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Phase } from '../../../../core/player/player.types';
import { MoveCardReason } from '../../../../core/room/room.types';
import { Skill } from '../../../../core/skill/skill';
import { PriorityType } from '../../../../core/skill/skill.types';

export const bazhenzongshu_lose = sgs.TriggerEffect({
    name: 'bazhenzongshu_lose',
    auto_log: 1,
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) =>
                c.name === 'bazhenzongshu' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const bazhenzongshu = data.getCard(
            (d, c) =>
                c.name === 'bazhenzongshu' && d.toArea === room.discardArea
        );
        const _data = data.get(bazhenzongshu);
        return {
            from: _data.player,
            cards: [bazhenzongshu],
        };
    },
    async cost(room, data: MoveCardEvent, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data: MoveCardEvent, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: CardPut.Down,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});

export const bazhenzongshu = sgs.CardUseEquip({
    name: 'bazhenzongshu',
    effects: [bazhenzongshu_lose.name],
});

sgs.setCardData('bazhenzongshu', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'u',
});

export const bazhenzongshu_skill = sgs.Skill({
    name: 'bazhenzongshu',
    attached_equip: 'bazhenzongshu',
});

const bazhenzongshu_skill_pool = [
    ['wars.caohong', 'wars.caohong.heyi'],
    ['wars.jiangwei', 'wars.jiangwei.tianfu'],
    ['wars.jiangqin', 'wars.jiangqin.niaoxiang'],
    ['wars.zhangren', 'wars.zhangren.fengshi'],
    ['xl.yanghu', 'xl.yanghu.chonge'],
    ['xl.wangtaowangyue', 'xl.wangtaowangyue.huyi'],
];

bazhenzongshu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
                const _data = data.get(this.skill.sourceEquip);
                if (!_data) return false;
                return (
                    _data.reason === MoveCardReason.Obtain &&
                    _data.toArea.player !== player
                );
            }
        },
        async cost(room, data: MoveCardEvent, context) {
            return await data.cancle([this.skill.sourceEquip]);
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (this.player) {
                        const general = room.generalArea.generals.find((v) =>
                            bazhenzongshu_skill_pool.find((s) => s[0] === v.id)
                        );
                        if (general) {
                            room.generalArea.remove([general]);
                            this.player.handArea.add([general]);
                            const skill_name = bazhenzongshu_skill_pool.find(
                                (v) => v[0] === general.id
                            )[1];
                            const skill = await room.addSkill(
                                skill_name,
                                this.player,
                                {
                                    source: `effect:${this.id}`,
                                    showui: 'default',
                                }
                            );
                            this.setData('skill', skill);
                            this.player.setMark('bazhenzongshu', skill.name, {
                                visible: true,
                            });
                        }
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    await this.getData<Skill>('skill')?.removeSelf();
                    this.player.removeMark('bazhenzongshu');
                },
            },
        ],
    })
);

bazhenzongshu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const diaohulishan = room.createVirtualCardByNone(
                        'diaohulishan',
                        undefined,
                        false
                    );
                    diaohulishan.custom.method = 1;

                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Black;
                                },
                                onChange(type, item) {
                                    if (type === 'add')
                                        diaohulishan.addSubCard(item);
                                    if (type === 'remove')
                                        diaohulishan.delSubCard(item);
                                    diaohulishan.set();
                                    this._use_or_play_vcard = diaohulishan;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '八阵总述：你可以将一张黑色牌当【调虎离山】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                player.hp > 0 &&
                data.from === player &&
                data.has('diaohulishan')
            ) {
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 1;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);
