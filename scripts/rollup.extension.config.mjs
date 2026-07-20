/**
 * Rollup 配置——打包单个扩展为 IIFE。
 * 用法：由 build-extension.ts 调用，通过环境变量 EXT_NAME 指定扩展名。
 *
 * 扩展独立编译，不打包核心模块——核心通过 sgs 全局对象访问。
 */

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    output: {
        format: 'iife',
        name: process.env.EXT_NAME?.replace(/[^a-zA-Z0-9]/g, '_') || 'extension',
        globals: {},
    },
    external: [
        // 核心模块不作为外部依赖——扩展通过 sgs.* 全局访问
        /^@shared\/.*/,
        /^\.\.\/shared\/.*/,
        /^lodash/,
        /^@colyseus\/schema/,
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,
            sourceMap: true,
        }),
    ],
};
