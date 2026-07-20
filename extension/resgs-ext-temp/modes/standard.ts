/** 标准身份局模式——ModeBuilder 示例 */
new sgs.ModeBuilder('standard')
    .maxPlayer(8)
    .isTeamMode(false)
    .settings({ enableLuckyCard: [] })
    .rules('standard_rules')
    .beforeStart(async (_room) => {
        // 标准模式初始化：分配身份、选将、发起始手牌
    })
    .register();
