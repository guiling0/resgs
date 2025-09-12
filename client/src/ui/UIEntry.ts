const { regClass } = Laya;
import { S } from '../singleton';
import { UIEntryBase } from './UIEntry.generated';
import { ScenesEnum } from '../enums';
import { GameRoom } from '../core/room/room';
import { AloneServerRoom } from '../server/server_table';
import { RoomOption } from '../core/types';
import { ServerConfig } from '../config';

@regClass()
export class UIEntry extends UIEntryBase {
    onAwake(): void {
        this.Btn_EntryGame.on(Laya.Event.CLICK, this, this.onEntryClick);
        this.Btn_Test.on(Laya.Event.CLICK, this, this.onTest);
        this.Btn_Lobby.on(Laya.Event.CLICK, this, this.onLobby);

        this.Btn_Test.visible = this.Btn_Lobby.visible = Laya.LayaEnv.isPreview;
    }

    protected async onEntryClick() {
        const username = this.Input_Account.text;
        const password = this.Input_Password.text;
        if (username === '') return S.ui.toast('请输入账号');
        if (password === '') return S.ui.toast('请输入密码');
        // clientConfig.host = this.Input_Server.text;
        S.client.connect();
        if (
            await S.client.login({
                username,
                password,
                core_version: '',
                packages: [],
                client_version: '1.0.92',
            })
        ) {
            this.onLobby();
        }
    }

    protected async onLobby() {
        if (!this.nobgm.selected) {
            S.ui.playBgm(`${ServerConfig.res_url}/audio/system/lobby.mp3`);
        }
        S.ui.openScene(ScenesEnum.Lobby);
    }

    protected async onTest() {
        const options: RoomOption = {
            name: '国战测试',
            mode: 'wars',
            playerCountMax: 10,
            responseTime: 12,
            extensions: ['StandardCards', 'StandardExCards', 'JunZhengCards'],
            generals: [
                'default.shibingn',
                'default.shibingv',

                'wars.caocao',
                'wars.simayi',
                'wars.xiahoudun',
                'wars.zhangliao',
                'wars.xuchu',
                'wars.guojia',
                'wars.zhenji',
                'wars.xiahouyuan',
                'wars.zhanghe',
                'wars.xuhuang',
                'wars.caoren',
                'wars.dianwei',
                'wars.xunyu',
                'wars.caopi',
                'wars.yuejin',

                'wars.liubei',
                'wars.guanyu',
                'wars.zhangfei',
                'wars.zhugeliang',
                'wars.zhaoyun',
                'wars.machao',
                'wars.huangyueying',
                'wars.huangzhong',
                'wars.weiyan',
                'wars.pangtong',
                'wars.wolong',
                'wars.liushan',
                'wars.menghuo',
                'wars.zhurong',
                'wars.ganfuren',

                'wars.sunquan',
                'wars.ganning',
                'wars.lvmeng',
                'wars.huanggai',
                'wars.zhouyu',
                'wars.daqiao',
                'wars.luxun',
                'wars.sunshangxiang',
                'wars.sunjian',
                'wars.xiaoqiao',
                'wars.taishici',
                'wars.zhoutai',
                'wars.lusu',
                'wars.zhangzhaozhanghong',
                'wars.dingfeng',

                'wars.huatuo',
                'wars.lvbu',
                'wars.diaochan',
                'wars.yuanshao',
                'wars.yanliangwenchou',
                'wars.jiaxu',
                'wars.pangde',
                'wars.zhangjiao',
                'wars.caiwenji',
                'wars.mateng',
                'wars.kongrong',
                'wars.jiling',
                'wars.tianfeng',
                'wars.panfeng',
                'wars.zoushi',

                'wars.dengai',
                'wars.caohong',
                'wars.jiangwei',
                'wars.jiangwanfeiyi',
                'wars.xusheng',
                'wars.jiangqin',
                'wars.yuji',
                'wars.hetaihou',

                'wars.lidian',
                'wars.zangba',
                'wars.madai',
                'wars.mifuren',
                'wars.sunce',
                'wars.chenwudongxi',
                'wars.dongzhuo',
                'wars.zhangren',

                'wars.xunyou',
                'wars.bianfuren',
                'wars.masu',
                'wars.shamoke',
                'wars.lvfan',
                'wars.lingtong',
                'wars.zuoci',
                'wars.lijueguosi',

                'wars.yujin',
                'wars.cuiyanmaojie',
                'wars.fazheng',
                'wars.wangping',
                'wars.wuguotai',
                'wars.lukang',
                'wars.yuanshu',
                'wars.zhangxiu',

                'wars.huaxin',
                'wars.yanghu_wei',
                'wars.zongyu',
                'wars.dengzhi',
                'wars.luyusheng',
                'wars.fengxi',
                'wars.miheng',
                'wars.xunchen',

                'wars.lord_caocao',
                'wars.lord_liubei',
                'wars.lord_sunquan',
                'wars.lord_zhangjiao',

                'wars.simayi_jin',
                'wars.zhangchunhua_jin',
                'wars.simashi',
                'wars.simazhao',
                'wars.simazhou',
                'wars.simaliang',
                'wars.simalun',
                'wars.shibao',
                'wars.yanghuiyu',
                'wars.wangyuanji',
                'wars.weiguan',
                'wars.jiachong',
                'wars.guohuai_jin',
                'wars.wangjun',
                'wars.malong',

                'wars.yanghu',
                'wars.duyu',
                'wars.zhanghuyuechen',
                'wars.wenyang',
                'wars.wangxiang',
                'wars.baifuren',
                'wars.yangjun',
                'wars.sunxiu_jin',

                'wars.jiananfeng',
                'wars.xiahouhui',

                'wars.lord_simayi',

                'xl.simayan',
                'xl.simazhao',
                'xl.wangyuanji',
                'xl.wenyang',
                'xl.simafu',
                'xl.simawang',
                'xl.zhanghua',
                'xl.peixiu',
                'xl.wangjun',
                'xl.hufen',
                'xl.xiahouhui',
                'xl.wanghun',
                'xl.zhongyan',
                'xl.tangbin',
                'xl.huliehuyuan',

                'xl.yanghu',
                'xl.duyu',
                'xl.weiguan',
                'xl.zhouzhi',
                'xl.malong',
                'xl.shantao',
                'xl.jishao',
                'xl.simashi',
                'xl.yanghuiyu',

                'xl.wangxiang',
                'xl.luji_jin',
                'xl.luyun',

                'xl.lord_simayan',

                'xl.caozhi',
                'xl.cuifei',
                'xl.guansuo',
                'xl.wangtaowangyue',
                'xl.zhuju',
                'xl.sunluyu',
                'xl.zhangze',
                'xl.chenhuiqian',
                'xl.shichong',
                'xl.lvzhu',

                'wars.zhongyan',
                'wars.wanghun',

                'wars.v2025.luxun',
                'wars.v2025.huangzhong',
                'wars.v2025.jiling',
                'wars.v2025.panfeng',

                'caomao',
            ],
            settings: {
                // lordEquip: 'true',
                // banCountry: 'true',
                zuobi: 'true',
                // randomSeat: 'true',
                // watchNext: 'true',
            },

            chooseGeneralCount: 10,
            luckyCardCount: 0,
        };
        const server = new AloneServerRoom();
        const room = new GameRoom('alone_server', options);
        server.state.game = room;
        S.ui.openScene(ScenesEnum.Room, [server]);
    }
}
