/**
 * 组织所有扩展包的加载顺序。
 * 先 cards（类型定义），再 generals（依赖卡牌类型）。
 */
import './cards/standard';
import './generals';
