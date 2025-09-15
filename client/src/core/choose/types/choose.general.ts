import { General } from '../../general/general';
import { ChooseDataBase } from '../choose.types';

export interface ChooseGeneralData extends ChooseDataBase<General> {
    type: 'general';
}
