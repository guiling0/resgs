/**
 * kb:build — 知识库一键全量重建（依次执行生成与校验脚本）。
 * 顺序：api → links → refs → mapping → index → check
 *（index 须在 api 之后，使 project-api/ 进入全库索引；check 最后校验闭环）。
 */
const { execFileSync } = require('child_process');
const path = require('path');

const scripts = [
    'kb-api.cjs',
    'kb-links.cjs',
    'kb-refs.cjs',
    'kb-mapping.cjs',
    'kb-index.cjs',
    'kb-check.cjs',
];
for (const s of scripts) {
    console.log(`\n=== ${s} ===`);
    execFileSync(process.execPath, [path.join(__dirname, s)], { stdio: 'inherit' });
}
console.log('\n[kb:build] 完成');
