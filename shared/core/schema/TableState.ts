import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
import { SeatState } from './SeatState';

/**
 * 等待房间子状态。
 */
export class TableState extends Schema {
    @type('string') ownerId: string = ''; //房主
    @type({ map: SeatState }) seats: MapSchema<SeatState> = new MapSchema();
    @type(['string']) seatTags: ArraySchema<string> = new ArraySchema();
}
