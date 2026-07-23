import { General } from '@shared/core/general/General';

/**
 * 座位内武将展示组件的公共接口。
 * 所有 seat_general / seat_dual_general / seat_m_general /
 * seat_m_dual_general / selfseat_general 均实现此接口。
 */
export interface ISeatGeneral {
    /** 绑定武将数据并刷新显示 */
    onBind(general: General): void;

    /** 解绑并清空显示 */
    onUnbind(): void;

    /** 更新明置/暗置 (国战) */
    updatePut(put: boolean): void;

    /** 更新锁定/禁止明置 */
    updateLock(locked: boolean): void;
}
