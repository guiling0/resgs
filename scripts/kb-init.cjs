/**
 * kb:init — 配置 git hooksPath 指向 .githooks（一次即可，配置入库）。
 */
const { execSync } = require('child_process');
const path = require('path');

const hooksDir = path.resolve(__dirname, '..', '.githooks');
execSync(`git config core.hooksPath "${hooksDir.replace(/\\/g, '/')}"`, { stdio: 'inherit' });
console.log(`[kb:init] core.hooksPath 已指向 ${hooksDir}`);
