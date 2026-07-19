#!/bin/bash
# 编译检查 shared/ 代码
cd "$(dirname "$0")/.."
mkdir -p logs
LOG="logs/check-$(date +%Y%m%d-%H%M%S).log"
cat tsconfig.json | sed 's/"ignoreDeprecations": "6.0"/\/\/ "ignoreDeprecations": "6.0"/' > tsconfig.check.json
npx tsc --noEmit --project tsconfig.check.json 2>&1 | tee "$LOG"
rm -f tsconfig.check.json
echo "[check] log → $LOG"
