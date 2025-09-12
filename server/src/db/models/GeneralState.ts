import { ObjectId } from 'mongodb';

export interface GeneralState {
    _id: ObjectId;
    generalId: string;

    //模式统计数据
    statsByMode: {
        wars_temp_jin: WarsState;
        wars_temp_xl: WarsState;
        doudizhu: DouDiZhuState;
    };

    updateAt: Date;
}

/** 国战模式的数据 */
export interface WarsState {
    offered: number; // 出场数
    initialPicks: number; // 初始选择次数
    changePicks: number; // 变更选择次数
    removals: number; // 移除次数

    initialPickWins: number; // 初始选择的胜利次数
    changePickWins: number; // 变更选择的胜利次数
    overallWins: number; // 总胜利次数

    pickRate: number; // 选择率=initialPicks/offered
    initialPickWinRate: number; // 初始选择胜率=initialPickWins/initialPicks
    winRate: number; // 综合胜率=overallWins/(initialPicks+changePicks)

    //作为主将的数据
    asHead: {
        initialPicks: number; //初始选择次数
        changePicks: number; //变更选择次数
        removels: number; //移除次数

        initialPickWins: number; //初始选择的胜利次数
        changePicksWins: number; //变更选择的胜利次数
        overallWins: number; //总胜利次数

        pickRate: number; //选择率=initialPickWins/offered
        initialPickWinRate: number; //初始选择胜率=initialPickWins/initialPicks
        winRate: number; //综合胜率=overallWins/(initialPicks+changePicks)
    };
    //作为副将的数据 与主将相同
    asDeputy: {
        initialPicks: number; //初始选择次数
        changePicks: number; //变更选择次数
        removels: number; //移除次数

        initialPickWins: number; //初始选择的胜利次数
        changePicksWins: number; //变更选择的胜利次数
        overallWins: number; //总胜利次数

        pickRate: number; //选择率=initialPickWins/offered
        initialPickWinRate: number; //初始选择胜率=initialPickWins/initialPicks
        winRate: number; //综合胜率=overallWins/(initialPicks+changePicks)
    };
}

export interface DouDiZhuState {
    offered: number; // 出场数
    picks: number; // 选择次数
    wins: number; //获胜次数

    pickRate: number; // 选择率=picks/offered
    winRate: number; // 胜率=wins/picks

    asLandLord: {
        offered: number; // 出场数
        picks: number; // 选择次数
        wins: number; //获胜次数

        pickRate: number; // 选择率=picks/offered
        winRate: number; // 胜率=wins/picks
    };

    asFarmer: {
        offered: number; // 出场数
        picks: number; // 选择次数
        wins: number; //获胜次数

        pickRate: number; // 选择率=picks/offered
        winRate: number; // 胜率=wins/picks
    };
}
