/** 杀——基本牌，伤害类，CardBuilder 示例 */
new sgs.CardBuilder('sha')
    .type(sgs.CardType.Basic)
    .subtype(sgs.CardSubType.Basic)
    .damage(true)
    .register();
