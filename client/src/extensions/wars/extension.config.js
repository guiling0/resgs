import terser from '@rollup/plugin-terser';
/**
 * 国战模式扩展
 */
const name = 'wars'
const version = '1.0'

export default {
    input: `./dist/extensions/${name}/index.js`,
    output: {
        file: `../../../../client/bin/extensions/${name}@${version}.js`,
        format: 'iife',
        plugins: [terser()]
    }
};