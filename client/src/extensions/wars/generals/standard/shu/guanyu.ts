import { CardColor } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { Gender } from '../../../../../core/general/general.type';
import { GameRoom } from '../../../../../core/room/room';
import {
    PriorityType,
    TriggerEffectContext,
} from '../../../../../core/skill/skill.types';

function checkLiubeiLevel(room: GameRoom) {
    const wuhu = room.getEffect(room.getMark<number>('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}

export const guanyu = sgs.General({
    name: 'wars.guanyu',
    kingdom: 'shu',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});
export const wusheng = sgs.Skill({
    name: 'wars.guanyu.wusheng',
});

function wusheng_choose(room: GameRoom, context: TriggerEffectContext) {
    const from = context.from;
    const sha = room.createVirtualCardByNone('sha', undefined, false);
    sha.custom.method = 1;
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: from.getSelfCards(),
                filter(item, selected) {
                    if (checkLiubeiLevel(room)) {
                        return true;
                    }
                    return item.color === CardColor.Red;
                },
                onChange(type, item) {
                    if (type === 'add') sha.addSubCard(item);
                    if (type === 'remove') sha.delSubCard(item);
                    sha.set({ attr: [] });
                    this._use_or_play_vcard = sha;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '武圣：你可以将一张红色牌当【杀】',
        },
    };
}

wusheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return wusheng_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('sha');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

wusheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedPlayCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return wusheng_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === player && data.has('sha');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

guanyu.addSkill(wusheng);
