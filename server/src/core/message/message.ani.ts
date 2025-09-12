import { CardAni, FaceAni, GlobalAni } from '../ani.config';
import { AreaId } from '../area/area.type';
import { CardPut, GameCardId, VirtualCardData } from '../card/card.types';
import { CustomString } from '../custom/custom.type';
import { GeneralId } from '../general/general.type';
import { PlayerId } from '../player/player.types';

/** 在指定玩家的脸上播放动画 */
export interface MsgPlayFaceAni {
    type: 'MsgPlayFaceAni';
    player: PlayerId;
    /** 需要播放的动画 */
    ani: string;
    /** 动画携带数据 */
    data?: any;
}

/** 在指定卡牌上播放动画 */
export interface MsgPlayCardAni {
    type: 'MsgPlayCardAni';
    card: GameCardId;
    /** 需要播放的动画 */
    ani: CardAni;
    /** 是否仅让处理区的牌播放动画 */
    only_process?: boolean;
    /** 动画携带数据 */
    data?: any;
}

/** 播放全局动画 */
export interface MsgPlayGlobalAni {
    type: 'MsgPlayGlobalAni';
    /** 需要播放的动画 */
    ani: string;
    /** 动画携带数据 */
    data?: any;
}

export interface MsgPlayCardMoveAni {
    type: 'MsgPlayCardMoveAni';
    data: {
        cards: GameCardId[] | GeneralId[] | VirtualCardData[] | number[];
        fromArea: AreaId;
        toArea: AreaId;
        movetype: CardPut;
        puttype: CardPut;
        animation: boolean;
        moveVisibles: PlayerId[];
        cardVisibles: PlayerId[];
        /** 是否实际移动此牌 */
        isMove: boolean;
        /** 移动此牌时显示的文本 */
        label?: CustomString;
        /** 移动时添加log */
        log?: CustomString;
        /** 移动时显示视为卡牌 */
        viewas?: VirtualCardData;
    }[];
}

export interface MsgPlayDirectLine {
    type: 'MsgPlayDirectLine';
    source: string;
    targets: string[];
    playType: number;
}
