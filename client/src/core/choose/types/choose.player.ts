import { GamePlayer } from '../../player/player';
import { ChooseDataBase } from '../choose.types';

export interface ChoosePlayerData extends ChooseDataBase<GamePlayer> {
    type: 'player';
    /** 排除死亡的玩家 默认为true */
    excluesDeath?: boolean;
    /** 在使用牌中排除牌原本的限制 默认为false */
    excluesCardLimit?: boolean;
    /** 在使用牌中排除牌的次数限制 默认为true */
    excluesCardTimesLimit?: boolean;
    /** 在使用牌中排除牌的距离限制 默认为false */
    excluesCardDistanceLimit?: boolean;
    /** 让目标为牌的卡牌必定不通过检测 默认为false */
    excluesToCard?: boolean;
}
