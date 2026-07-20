import { MapSchema, Schema, type } from '@colyseus/schema';
import { MarkState } from './MarkState';
export class CardState extends Schema {
    @type('string')
    id: string = '';
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
