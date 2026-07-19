#!/bin/bash
# 运行全部测试套件
cd "$(dirname "$0")/.."
mkdir -p logs
LOG="logs/test-$(date +%Y%m%d-%H%M%S).log"
{
echo "=== test-all ==="
tests=(
    "damage"
    "dying-death"
    "hp-event"
    "area-manager"
    "player-manager"
    "event-manager"
    "turn-event"
)
passed=0
failed=0
for t in "${tests[@]}"; do
    echo -n "  $t ... "
    result=$(npx tsx "shared/test/$t.test.ts" 2>&1 | grep "总计")
    echo "$result"
    if echo "$result" | grep -q "失败: 0"; then
        ((passed++))
    else
        ((failed++))
    fi
done
echo "---"
echo "passed=$passed failed=$failed"
} 2>&1 | tee "$LOG"
echo "[test-all] log → $LOG"
