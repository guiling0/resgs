import { ChooseResultCount, RequestOptionData } from '../choose/choose.types';
import { ChoosePlayerData } from '../choose/types/choose.player';
import { CustomString } from '../custom/custom.type';
import { EventData } from '../event/data';
import { EventTriggers, Triggers } from '../event/triggers';
import {
    TargetCardListItem,
    TargetListItem,
    UseCardEvent,
    UseCardSpecialEvent,
    UseCardToCardEvent,
} from '../event/types/event.use';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { TriggerEffectContext } from '../skill/skill.types';
import { VirtualCardData } from './card.types';
import { VirtualCard } from './vcard';

export interface CardUseSkillData {
    /** 卡牌名 */
    name: string;
    /** 使用方法 */
    method: number;
    /** 默认使用时机 */
    trigger: Triggers;
    /** 同时发起询问 */
    sameTime?: boolean;
    /** 包含的效果 */
    effects?: string[];
    /** 选中此牌后的提示。如果默认使用时机是出牌阶段，那么在选中对应的牌名后会修改为对应的提示。否则在没有提供提示时，会将该提示作为提示填充到使用牌询问中 */
    prompt?: (
        this: CardUseSkillData,
        room: GameRoom,
        from: GamePlayer,
        card: VirtualCard,
        context: TriggerEffectContext
    ) => { prompt?: CustomString; thinkPrompt?: CustomString };
    /** 能否使用。此时牌还没有被使用。所以card为一张无实体牌对应的虚拟牌。data为触发需要使用事件的源事件 */
    condition: (
        this: CardUseSkillData,
        room: GameRoom,
        from: GamePlayer,
        card: VirtualCard,
        data: EventData
    ) => boolean | VirtualCard;
    /** 次数检测。默认返回Infinity */
    timeCondition: (
        this: CardUseSkillData,
        room: GameRoom,
        from: GamePlayer,
        card: VirtualCard
    ) => number;
    /** 距离条件。默认返回true */
    distanceCondition: (
        this: CardUseSkillData,
        room: GameRoom,
        from: GamePlayer,
        target: GamePlayer,
        card: VirtualCard
    ) => boolean;
    /** 目标选择方法 */
    target: (
        this: CardUseSkillData,
        room: GameRoom,
        from: GamePlayer,
        card: VirtualCard
    ) => ChoosePlayerData;
    /** 使用之前执行 */
    onuse: (
        this: CardUseSkillData,
        room: GameRoom,
        data: UseCardEvent | UseCardToCardEvent | UseCardSpecialEvent
    ) => Promise<void>;
    /** 卡牌效果 */
    effect: (
        this: CardUseSkillData,
        room: GameRoom,
        target: TargetListItem | TargetCardListItem,
        data: UseCardEvent | UseCardToCardEvent | UseCardSpecialEvent
    ) => Promise<void>;
}

export type CreateCardUseSkill = Partial<
    Omit<CardUseSkillData, 'name' | 'method' | 'trigger'>
> & {
    name: string;
    method: number;
    trigger: Triggers;
};

export type CreateCardUseEquipSkill = Partial<
    Omit<
        CardUseSkillData,
        | 'name'
        | 'method'
        | 'trigger'
        | 'sameTime'
        | 'prompt'
        | 'target'
        | 'targetCard'
        | 'effect'
    >
> & {
    name: string;
};
