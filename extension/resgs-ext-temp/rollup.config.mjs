import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.ts',
    output: {
        file: 'dist/extension.js',
        format: 'iife',
        name: 'extension',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({ declaration: false, sourceMap: false }),
    ],
};
