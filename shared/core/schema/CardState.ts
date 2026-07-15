import { MapSchema, Schema, type } from '@colyseus/schema';
import { MarkState } from './MarkState';
export class CardState extends Schema {
    @type('number')
    id: number = 0;
    @type('string')
    area: string = '';
    @type('boolean')
    put: boolean = false;
    @type('string')
    label: string = '';

    /** 标记状态 */
    @type({ map: MarkState })
    public markStates: MapSchema<MarkState> = new MapSchema();
}
