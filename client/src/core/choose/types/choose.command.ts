import { ChooseDataBase } from '../choose.types';

export interface ChooseCommandData extends ChooseDataBase<number> {
    type: 'command';
}
