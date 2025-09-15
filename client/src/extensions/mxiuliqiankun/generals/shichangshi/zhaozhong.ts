import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const cs_zhaozhong = sgs.General({
    name: 'cs_zhaozhong',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const chiye = sgs.Skill({
    name: 'cs_zhaozhong.chiye',
});

chiye.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card &&
                data.card.name === 'sha' &&
                data.from === player &&
                data.current &&
                data.current.target
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '鸱咽',
                                    timebar: room.responseTime,
                                    prompt: `鸱咽：请选择至多一张牌，扣置于其的武将牌旁`,
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
            const puto = await room.puto({
                player: from,
                cards,
                toArea: target.sideArea,
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
            });
            cards.forEach((v) => v.setMark('mark.chiye', true));
            return puto;
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            target.setMark('mark.chiye', true, {
                type: 'cards',
                visible: true,
                areaId: target.sideArea.areaId,
                source: this.name,
            });
            const effect = await room.addEffect('chiye.delay', target);
            effect.setData('data', room.currentTurn);
        },
    })
);

export const chiye_delay = sgs.TriggerEffect({
    name: 'chiye.delay',
    trigger: EventTriggers.TurnEnd,
    can_trigger(room, player, data) {
        return (
            this.isOwner(player) &&
            this.getData('data') === data &&
            player.hasUpOrSideCards('mark.chiye')
        );
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = from.getUpOrSideCards('mark.chiye');
        return await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.removeMark('mark.chiye');
        await this.removeSelf();
    },
});

chiye.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.CauseDamage1,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                data.to &&
                data.to.getHandCards().length <= player.getHandCards().length &&
                data.to.getEquipCards().length <= player.getEquipCards().length
            );
        },
        async cost(room, data: DamageEvent, context) {
            data.number++;
            return true;
        },
    })
);

cs_zhaozhong.addSkill(chiye);

sgs.loadTranslation({
    ['mark.chiye']: '鸱咽',
});
