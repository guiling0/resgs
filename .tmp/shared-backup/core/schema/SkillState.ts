import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { MarkState } from './MarkState';
export class SkillState extends Schema {
    @type('number')
    id: number = 0;
    @type('string')
    playerId: string = '';
    /** 标记状态 */
    @type({ map: MarkState })
    markStates: MapSchema<MarkState> = new MapSchema();
    @type('string')
    showui: string = 'none';
    @type('string')
    sourceGeneral?: string;
    @type('string')
    sourceEquip?: string;
    @type('number')
    sourceEffect?: number;
    @type(['string'])
    invalids: ArraySchema<string> = new ArraySchema();
    @type('boolean')
    preshow: boolean = false;
}
