import { TurnEvent } from '../event/TurnEvent';
import { Room } from './Room';

/** 房间创建选项 */
export interface RoomOption {
    name: string;
    password?: string;
    /** 游戏模式标识（对应 sgs.modes key） */
    mode?: string;
    /** 最大玩家数 */
    playerCountMax?: number;
    /** 响应时间(秒) */
    responseTime?: number;
    /** 选将时间(秒) */
    chooseGeneralTime?: number;
    /** 启用的卡牌扩展包 */
    cards: string[];
    /** 启用的武将 */
    generals: string[];
    /** 初始选将数量 */
    chooseGeneralCount?: number;
    /** 手气卡次数 */
    luckyCardCount?: number;
    /** 其他设置 */
    settings: Record<string, any>;
}

export interface GameMode {
    /** 模式名 */
    name: string;
    /** 玩家数 */
    maxPlayer: number;
    /** 是否为团队模式 */
    isTeamMode: boolean;
    /** 额外设置项 客户端会根据此项构建UI，键->设置key，值->设置选项如果数组为空则表示切换为checkbox */
    settings: Record<string, string[]>;
    /** 不通用的规则技能 */
    rules: string;
    /** 游戏开始前调用（必须提供） */
    beforeStart: (room: Room) => Promise<void>;
    /** 主流程逻辑
     * 主流程指回合交替。它用于处理如何确定下一个进行回合的角色。
     * 如果不实现这个函数，则会按照默认的处理方式进行游戏。
     * 这个函数在游戏主循环中被调用，所以无需再内部实现循环逻辑
     * 默认的流程：由一号位开始进行回合，每回合结束后由该玩家的下家进行回合。每次额定回合重新轮到一号位时，轮数+1。
     * 你需要在内部实现中对turn参数的数据进行修改
     * 关于额外回合：主流程逻辑表示游戏中的每个额定回合如何确定，无需考虑额外回合的实现。
     */
    mainProcess?: (
        room: Room,
        turn: TurnEvent,
        last?: TurnEvent,
    ) => Promise<void>;
}
