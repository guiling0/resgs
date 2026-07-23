const fs = require('fs');
const path = require('path');
const resDir = 'C:/Users/74734/Desktop/resgsv1/clientv1/assets/resources';
const urls = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { scan(full); continue; }
    if (entry.name.endsWith('.meta') || entry.name.endsWith('.lh') || entry.name === '.DS_Store') continue;
    const rel = full.replace(/\\/g, '/').replace('C:/Users/74734/Desktop/resgsv1/clientv1/assets/', '');
    if (rel.startsWith('resources/prefabs/') || rel.startsWith('resources/scenes/')) continue;
    urls.push(rel);
  }
}
scan(resDir);
urls.sort();
const lines = urls.map(u => '    "' + u + '",').join('\n');
const content = 'export const RES_URLS: string[] = [\n' + lines + '\n];\n';
fs.mkdirSync('C:/Users/74734/Desktop/resgsv1/clientv1/src/data', { recursive: true });
fs.writeFileSync('C:/Users/74734/Desktop/resgsv1/clientv1/src/data/res_list.ts', content, 'utf8');
console.log('Generated ' + urls.length + ' entries');
