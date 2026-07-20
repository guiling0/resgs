/**
 * @name resgs-ext-temp
 * @description 扩展模板——标准包示例
 * @author ddgl
 * @version 0.1.0
 */

export const meta = {
    name: 'resgs-ext-temp',
    description: '扩展模板——标准包示例',
    author: 'ddgl',
    version: '0.1.0',
};

// 扩展上下文——registerCards 自动使用此名作为 ID 前缀
sgs.setExtensionContext(meta.name);

// 导入即加载——pkg/index.ts 组织所有扩展包的加载顺序
import './pkg';
