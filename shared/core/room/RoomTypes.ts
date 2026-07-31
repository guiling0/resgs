/** 房间创建选项 */
export interface RoomOption {
    name: string;
    password?: string;
    /** 游戏模式标识（对应 sgs.modes key） */
    mode: string;
    /** 最大玩家数 */
    playerCountMax?: number;
    /** 响应时间(秒) */
    responseTime?: number;
    /** 选将时间(秒) */
    chooseGeneralTime?: number;
    /** 启用的卡牌扩展包 */
    cards: string[];
    /** 启用的武将 */
    generals: string[];
    /** 初始选将数量 */
    chooseGeneralCount?: number;
    /** 手气卡次数 */
    luckyCardCount?: number;
    /** 其他设置 */
    settings: Record<string, string>;
}
