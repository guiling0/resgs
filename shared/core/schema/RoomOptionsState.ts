import { Schema, type, MapSchema } from '@colyseus/schema';
/**
 * 房间创建选项。
 */
export class RoomOptionsState extends Schema {
    @type('string') password: string = ''; //空则没有密码
    @type('string') mode: string = 'role';
    @type('number') playerCountMax: number = 8;
    @type('number') responseTime: number = 15; //响应时间(秒)
    @type('number') chooseGeneralTime: number = 15; //选将时间(秒)
    @type('number') chooseGeneralCount: number = 5; //初始选将数量
    @type('number') luckyCardCount: number = 0; //手气卡次数
    @type(['string']) cards: string[] = []; //启用的卡牌扩展包
    @type(['string']) generals: string[] = []; //启用的武将
    @type({ map: 'string' }) settings: MapSchema<string> = new MapSchema();
}
