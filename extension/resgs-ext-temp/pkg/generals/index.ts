/**
 * 组织所有武将扩展包。
 * 每个大包被分为若干子包（如标准包 → 魏/蜀/吴/群），
 * 子包下每个文件导出该武将的 GeneralData。
 */

import { caocao } from './standard/wei/caocao';

// ===== 标准包 =====
sgs.GeneralPackage('standard', [
    { name: 'standard.wei', generals: [caocao] },
    { name: 'standard.shu', generals: [] },
    { name: 'standard.wu',  generals: [] },
    { name: 'standard.qun', generals: [] },
]);
