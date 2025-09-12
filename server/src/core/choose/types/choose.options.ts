import { CustomString } from '../../custom/custom.type';
import { ChooseDataBase } from '../choose.types';

/**
 * 选择选项
 * 注意：本选择与选择设置中的showMainButtons设置互斥。
 *
 */
export interface ChooseOptionsData extends ChooseDataBase<CustomString> {
    type: 'option';
}
