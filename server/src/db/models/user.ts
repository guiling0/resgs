import { ObjectId } from 'mongodb';

/** 用户基础字段 */
export interface DbUser {
    _id?: ObjectId;

    username: string; // 唯一索引
    passwordHash: string; // bcrypt
    nickname: string;
    avatar: string;
    registerIp: string;
    registerTime: Date;
    lastLoginTime: Date;

    reputaionScore: number; // 默认 100，范围 0-110
    escapes: number;
    cumulativeEscapes: number;

    banned: {
        isBanned: boolean;
        until: Date | null;
        reason: string;
        by: string;
    };
    muted: {
        isMuted: boolean;
        until: Date | null;
        reason: string;
        by: string;
    };
    gameBanned: {
        isGameBanned: boolean;
        until: Date | null;
        reason: string;
        by: string;
    };

    titles: string[];
    currentTitle: string | null;

    role: 'player' | 'admin' | 'childAdmin' | 'tester';

    recentGames: {
        gameId: string;
        mode: string;
        generals: string[]; //使用的武将
        won: number; //0平局 1获胜 2失败
        time: number; //游戏时长
    }[]; //最多保存10局
}

/** 用户模式统计 */
export interface UserModeStat {
    _id: ObjectId;
    userId: ObjectId;
    mode: string;

    total: number;
    wins: number;
    losses: number;
    winRate: number;

    extraStats: Record<string, number>;

    updateAt: Date;
}

/** 用户趣味统计 */
export interface UserFunStat {
    _id: ObjectId;
    userId: ObjectId;

    // 乐不思蜀（自己使用的）
    lebuUsed: number; // 使用乐不思蜀的次数
    lebuUsedJudgeCount: number; // 自己使用的乐不思蜀进行判定的次数
    lebuUsedJudgeNotHeart: number; // 自己使用的乐不思蜀判定不为红桃的次数

    // 兵粮寸断（自己使用的）
    bingliangUsed: number; // 使用兵粮寸断的次数
    bingliangUsedJudgeCount: number; // 自己使用的兵粮寸断进行判定的次数
    bingliangUsedJudgeNotClub: number; // 自己使用的兵粮寸断判定不为梅花的次数

    // 乐不思蜀（自己作为目标）
    lebuTargetJudgeCount: number; // 乐不思蜀判定次数
    lebuTargetJudgeHeart: number; // 乐不思蜀判定为红桃的次数

    // 兵粮寸断（自己作为目标）
    bingliangTargetJudgeCount: number; // 兵粮寸断判定次数
    bingliangTargetJudgeClub: number; // 兵粮寸断判定为梅花的次数

    // 八卦阵
    baguaJudgeCount: number; // 八卦阵判定次数
    baguaJudgeRed: number; // 八卦阵判定为红色的次数

    // 闪电
    shandianJudgeCount: number; // 闪电判定次数
    shandianHitCount: number; // 闪电命中次数（判定为黑桃2-9）
    shandianKillCount: number; // 闪电致死次数

    // 社交统计
    flowersReceived: number; // 收到鲜花数
    eggsReceived: number; // 收到臭鸡蛋数
    likesReceived: number; // 获得点赞数

    // 极端记录
    mostDamageInOneTurn: number; // 单回合最高伤害
    mostCardsInHand: number; // 手牌最多时数量
    longestWinStreak: number; // 最长连胜
    currentWinStreak: number; // 当前连胜
    mostKillsInOneTurn: number; // 单局一回合内使用杀的最高次数
    diedBeforeFirstTurn: number; // 没进行回合就死亡的次数
    maxSingleDamage: number; // 单次最高伤害值

    updatedAt: Date;
}
