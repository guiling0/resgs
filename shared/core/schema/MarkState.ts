import { ArraySchema, Schema, type } from '@colyseus/schema';
export class MarkState extends Schema {
    @type('string')
    key: string = '';

    @type('string')
    value: string = '';

    @type('string')
    source: string = '';

    @type(['string'])
    visible: ArraySchema<string> = new ArraySchema<string>();

    @type('string')
    values: string = '';

    @type('string')
    parseType: string = '';

    @type('string')
    refType: string = 'static';

    @type('string')
    refArea: string = '';

    @type('string')
    refMark: string = '';
}
