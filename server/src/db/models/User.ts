import { ObjectId } from 'mongodb';

export interface DbUser {
    _id?: ObjectId;
    username: string; //用户名(唯一)
    nickname: string; //(昵称) 默认与username一致
    passwordHash: string; //密码
    salt: string;
    //基础信息
    profile: {
        reputationScore: number;
        doudizhuScore: number;
        avatar: string; //头像Url
        title?: string; //显示称号
        titles: string[]; //拥有的称号
        lastLogin: Date; //最后登录时间
    };
    //注册信息
    registration: {
        ip: string; // 注册IP
        date: Date; // 注册时间
    };
    //权限相关
    privileges: {
        admin: boolean; // 是否管理员
        childAdmin: boolean;
        betaTester: boolean; // 是否测试白名单
    };
    //封禁和禁言
    status: {
        isBanned: boolean; //是否被封禁
        banReason?: string; //封禁原因
        banExpires?: Date; //封禁到期时间

        isMuted: boolean; // 是否被禁言
        muteReason?: string; // 禁言原因
        muteExpires?: Date; // 禁言过期时间

        isGameBanned: boolean; //是否禁止游戏
        gameBanReason?: string;
        gameBanExpires?: Date;
    };
    statsByMode: {
        //国战模式
        wars_temp_jin?: UserWarsState;
        wars_temp_xl?: UserWarsState;
        doudizhu?: {
            matches: number; //游戏总数
            wins: number; //胜场数
            escapes: number; //逃跑数
            asLandLord: {
                matches: number; //游戏总数
                wins: number; //胜场数
                escapes: number; //逃跑数
            };
            asFarmer: {
                matches: number; //游戏总数
                wins: number; //胜场数
                escapes: number; //逃跑数
            };
        };
    };
    ipHistory: string[]; //IP历史记录
    createdAt: Date; //创建时间
    updatedAt: Date; //更新时间
}

export interface UserWarsState {
    matches: number; //游戏总数
    wins: number; //胜场数
    escapes: number; //逃跑数
    asWei: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
    asShu: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
    asWu: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
    asQun: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
    asJin: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
    asYe: {
        matches: number; //游戏总数
        wins: number; //胜场数
        escapes: number; //逃跑数
    };
}
