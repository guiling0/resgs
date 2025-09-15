import { GameCard } from '../../card/card';
import { VirtualCardData } from '../../card/card.types';
import { ChooseDataBase } from '../choose.types';

export interface ChooseCardData extends ChooseDataBase<GameCard> {
    type: 'card';
    /** 被选中的卡牌是否即将被移动，默认为true。仅对主视角装备区里的牌有效，会将对应的装备技能暂时失效 */
    preMove?: boolean;
}

export interface ChooseVCardData extends ChooseDataBase<VirtualCardData> {
    type: 'vcard';
}
