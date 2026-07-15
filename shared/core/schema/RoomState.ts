import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { PlayerState } from './PlayerState';
import { CardState } from './CardState';
import { GeneralState } from './GeneralState';
import { SkillState } from './SkillState';
import { EffectState } from './EffectState';
import { MarkState } from './MarkState';

export class RoomState extends Schema {
    /** 房间ID */
    @type('string')
    public roomId: string = '';
    /** 游戏ID */
    @type('string')
    public gameId: string = '';
    /** 玩家状态 */
    @type({ map: PlayerState })
    public players: MapSchema<PlayerState> = new MapSchema();
    /** 卡牌区域数据 */
    @type({ map: ['number'] })
    public cardAreas: MapSchema<ArraySchema<number>> = new MapSchema();
    /** 卡牌状态 */
    @type({ map: CardState })
    public cardStates: MapSchema<CardState> = new MapSchema();
    /** 武将区域数据 */
    @type({ map: ['string'] })
    public generalAreas: MapSchema<ArraySchema<string>> = new MapSchema();
    /** 武将状态 */
    @type({ map: GeneralState })
    public generalStates: MapSchema<GeneralState> = new MapSchema();
    /** 技能状态 */
    @type({ map: SkillState })
    public skillStates: MapSchema<SkillState> = new MapSchema();
    /** 效果状态 */
    @type({ map: EffectState })
    public effectStates: MapSchema<EffectState> = new MapSchema();
    /** 标记状态 */
    @type({ map: MarkState })
    public markStates: MapSchema<MarkState> = new MapSchema();
}
