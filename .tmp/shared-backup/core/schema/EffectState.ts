import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { MarkState } from './MarkState';
export class EffectState extends Schema {
    @type('number')
    id: number = 0;
    @type('number')
    skillId: number = 0;
    @type('string')
    playerId: string = '';
    /** 标记状态 */
    @type({ map: MarkState })
    public markStates: MapSchema<MarkState> = new MapSchema();
    @type(['string'])
    invalids: ArraySchema<string> = new ArraySchema();
    @type(['string'])
    audios: ArraySchema<string> = new ArraySchema();
}
