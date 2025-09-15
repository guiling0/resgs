/** 游戏结束后的武将数据 */
export interface GeneralDbData {
    id: string;
    /** 是否为有效出场 */
    isEffective: boolean;
    /** 是否被禁用 */
    isBan: boolean;
    /** 是否选择 */
    isPick: boolean;
    /** 是否获胜 */
    isWin: boolean;
}

/** 房间设置 */
export interface RoomOption {
    /** 房间名 */
    name: string;
    /** 房间密码 */
    password?: string;
    /** 游戏模式 */
    mode?: string;
    /** 最大游戏人数 */
    playerCountMax?: number;
    /** 响应时间 */
    responseTime?: number;
    /** 启用的扩展包 仅包含非武将扩展包*/
    extensions: string[];
    //将池设置
    generals: string[];
    /** 初始选择武将的数量 */
    chooseGeneralCount?: number;
    /** 手气卡次数 */
    luckyCardCount?: number;
    /** 其他设置 */
    settings: { [key: string]: string };
}

export interface LoginData {
    username: string;
    password: string;
    core_version: string;
    packages: string[];
    client_version: string;
}

/** 房间源数据 */
export interface RoomMetedata {
    options: RoomOption;
    playerCount: number;
    spectaterCount: number;
    state: 'wait' | 'game' | 'end';
}

/** 房间客户端 */
export interface RoomUserData {
    stand: boolean;
    token: string;
}

/** 房间客户端验证 */
export interface RoomAuthData {}

/** 创建或加入提供的数据 */
export interface RoomJoinData {
    /** 房间设置 */
    options?: RoomOption;
    /** 是否是创建房间 */
    create: boolean;
    /** 用户名 */
    username: string;
    /** 登录凭证 */
    token: string;
    /** 需要完整的重连数据 */
    needData?: boolean;
    /** 提供房间密码 */
    password?: string;
    /** 以旁观方式加入 */
    spectate: boolean;
    /** 显示提供joinRepet可以重复加入房间 */
    joinRepet?: boolean;
}
