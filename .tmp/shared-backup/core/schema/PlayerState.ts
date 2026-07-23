import { MapSchema, Schema, type } from '@colyseus/schema';
import { MarkState } from './MarkState';
import { Phase } from '../player/PlayerTypes';
import { Gender } from '../general/GeneralType';

export class PlayerState extends Schema {
    /** 唯一玩家ID */
    @type('string')
    playerId: string = '';
    /** 玩家名字 */
    @type('string')
    username: string = '';
    /** 会话ID */
    @type('string')
    sessionId: string = '';
    /** 座次 */
    @type('number')
    seat: number = 0;
    /** 身份 */
    @type('string')
    role: string = '';
    /** 身份牌放置方式 */
    @type('boolean')
    rolePut: boolean = false;
    /** 势力 */
    @type('string')
    kingdom: string = 'none';
    /** 性别 */
    @type('number')
    gender: number = Gender.None;
    /** 体力 */
    @type('number')
    hp: number = 0;
    /** 体力上限 */
    @type('number')
    maxhp: number = 0;
    /** 护甲值 */
    @type('number')
    shield: number = 0;
    /** 连环状态 */
    @type('boolean')
    chained: boolean = false;
    /** 翻面状态 */
    @type('boolean')
    skip: boolean = false;
    /** 是否死亡 */
    @type('boolean')
    death: boolean = false;
    /** 休整轮次 */
    @type('number')
    rest: number = 0;
    /** 当前阶段 */
    @type('number')
    phase: number = Phase.None;
    /** 是否处于自己的回合内（客户端 UI 需要） */
    @type('boolean')
    inturn: boolean = false;
    /** 主将ID */
    @type('string')
    headId: string = '';
    /** 副将ID */
    @type('string')
    deputyId: string = '';
    /** 标记状态 */
    @type({ map: MarkState })
    markStates: MapSchema<MarkState> = new MapSchema();
}
