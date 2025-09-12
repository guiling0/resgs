import terser from '@rollup/plugin-terser';
/**
 * 扩展包描述
 */
const name = 'mlongxuexuanhuang'
const version = '1.0'

export default {
    input: `./dist/extensions/${name}/index.js`,
    output: {
        file: `../../../../client/bin/extensions/${name}@${version}.js`,
        format: 'iife',
        plugins: [terser()]
    }
};