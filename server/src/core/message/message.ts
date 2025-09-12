import { AreaId } from '../area/area.type';
import { GameCardData, GameCardId } from '../card/card.types';
import { ContextJsonData, GameRequestJsonData } from '../choose/choose.json';
import { MarkValue, CustomStringValue } from '../custom/custom.type';
import { GeneralId } from '../general/general.type';
import { PlayerId } from '../player/player.types';
import { EffectId, SkillId, SkillOptions } from '../skill/skill.types';
import { RoomOption } from '../types';
import {
    MsgPlayCardAni,
    MsgPlayCardMoveAni,
    MsgPlayDirectLine,
    MsgPlayFaceAni,
    MsgPlayGlobalAni,
} from './message.ani';
import { MsgDelay, MsgExter } from './message.exter';
import { MsgWindow } from './message.window';

export interface Message {
    /** 消息ID */
    msgId: number;
    /** 房间ID */
    roomId: string;
    /** 时间戳 */
    time: number;
    /** 消息内容 */
    data: MessageData;
    /** 排除玩家 */
    except?: string[];
}

export type MessageData = (
    | { type: 'None' }
    | MsgGameStart
    | MsgGameOver
    | MsgAddSkill
    | MsgSkillState
    | MsgRemoveSkill
    | MsgAddEffect
    | MsgRemoveEffect
    | MsgDelay
    | MsgRequest
    | MsgPlayFaceAni
    | MsgPlayCardMoveAni
    | MsgPlayCardAni
    | MsgPlayGlobalAni
    | MsgWindow
    | MsgPlayDirectLine
    | MsgGameChat
    | MsgGamePrompt
    | MsgChangeBgmAndBg
    | MsgBuildGameCard
) &
    MsgExter;

export interface MsgGameStart {
    type: 'MsgGameStart';
    options: RoomOption;
    players: { playerId: PlayerId; username: string }[];
    spectate: { playerId: PlayerId; username: string; spectateBy: PlayerId }[];
}

export interface MsgGameOver {
    type: 'MsgGameOver';
    wins: string[];
    scores: {
        player: string;
        score: {
            kill: number;
            damage: number;
            recover: number;
            assistant: number;
            kill_count: number;
            damage_count: number;
            recover_count: number;
        };
    }[];
    reason: string;
}

export interface MsgAddSkill {
    type: 'MsgAddSkill';
    id: number;
    skill: SkillId;
    player?: string;
    options: SkillOptions;
}

export interface MsgSkillState {
    type: 'MsgSkillState';
    id: number;
    preshow: boolean;
}

export interface MsgRemoveSkill {
    type: 'MsgRemoveSkill';
    id: number;
}

export interface MsgAddEffect {
    type: 'MsgAddEffect';
    id: number;
    effect_name: string;
    player?: string;
    skill?: number;
}

export interface MsgRemoveEffect {
    type: 'MsgRemoveEffect';
    id: number;
}

export interface MsgRequest {
    type: 'MsgRequest';
    id: number;
    player?: PlayerId;
    get_selectors?: {
        selectorId: string;
        context: ContextJsonData;
    };
    complete?: boolean;
}

export interface MsgGameChat {
    type: 'MsgGameChat';
    player: PlayerId;
    text: string;
}

export interface MsgGamePrompt {
    type: 'MsgGamePrompt';
    text: string;
}

export interface MsgChangeBgmAndBg {
    type: 'MsgChangeBgmAndBg';
    bgm_url?: string;
    bg_url?: string;
    bgm_loop?: boolean;
}

export interface MsgBuildGameCard {
    type: 'MsgBuildGameCard';
    data: GameCardData;
    initArea: AreaId;
}
