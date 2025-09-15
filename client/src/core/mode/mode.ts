import { TurnEvent } from '../event/types/event.turn';
import { GameRoom } from '../room/room';
import { SkillData } from '../skill/skill.types';

export interface GameModeData {
    /** 模式名 */
    name: string;
    /** 玩家数 */
    maxPlayer: number;
    /** 额外设置项 */
    settings: string[];
    /** 不通用的规则技能 */
    rules: string;
    /** 主流程逻辑
     * 主流程指回合交替。它用于处理如何确定下一个进行回合的角色。
     * 如果不实现这个函数，则会按照默认的处理方式进行游戏。
     * 这个函数在游戏主循环中被调用，所以无需再内部实现循环逻辑
     * 默认的流程：由一号位开始进行回合，每回合结束后由该玩家的下家进行回合。每次额定回合重新轮到一号位时，轮数+1。
     * 你需要在内部实现中对turn参数的数据进行修改
     * 关于额外回合：主流程逻辑表示游戏中的每个额定回合如何确定，无需考虑额外回合的实现。
     */
    mainProcess?: (room: GameRoom, turn: TurnEvent) => Promise<void>;
}

/** 创建一个新模式 */
export type CreateMode = Partial<Omit<GameModeData, 'name' | 'rules'>> & {
    name: string;
    rules: string | SkillData;
};
