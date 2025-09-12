"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarsZonghengGenerals = exports.WarsLordsGenerals = exports.WarsPowerQuanGenerals = exports.WarsPowerBianGenerals = exports.WarsPowerShiGenerals = exports.WarsPowerZhenGenerals = exports.WarsStandardGenerals = exports.WarsDefaultGenerals = void 0;
const shibing_1 = require("./default/shibing");
const guohuai_1 = require("./jin/guohuai");
const jiachong_1 = require("./jin/jiachong");
const malong_1 = require("./jin/malong");
const shibao_1 = require("./jin/shibao");
const simaliang_1 = require("./jin/simaliang");
const simalun_1 = require("./jin/simalun");
const simashi_1 = require("./jin/simashi");
const simayi_1 = require("./jin/simayi");
const simazhao_1 = require("./jin/simazhao");
const simazhou_1 = require("./jin/simazhou");
const wangjun_1 = require("./jin/wangjun");
const wangyuanji_1 = require("./jin/wangyuanji");
const weiguan_1 = require("./jin/weiguan");
const yanghuiyu_1 = require("./jin/yanghuiyu");
const zhangchunhua_1 = require("./jin/zhangchunhua");
const caiwenji_1 = require("./standard/qun/caiwenji");
const diaochan_1 = require("./standard/qun/diaochan");
const huatuo_1 = require("./standard/qun/huatuo");
const jiaxu_1 = require("./standard/qun/jiaxu");
const jiling_1 = require("./standard/qun/jiling");
const kongrong_1 = require("./standard/qun/kongrong");
const lvbu_1 = require("./standard/qun/lvbu");
const mateng_1 = require("./standard/qun/mateng");
const panfeng_1 = require("./standard/qun/panfeng");
const pangde_1 = require("./standard/qun/pangde");
const tianfeng_1 = require("./standard/qun/tianfeng");
const yanliangwenchou_1 = require("./standard/qun/yanliangwenchou");
const yuanshao_1 = require("./standard/qun/yuanshao");
const zhangjiao_1 = require("./standard/qun/zhangjiao");
const zoushi_1 = require("./standard/qun/zoushi");
const ganfuren_1 = require("./standard/shu/ganfuren");
const guanyu_1 = require("./standard/shu/guanyu");
const huangyueying_1 = require("./standard/shu/huangyueying");
const huangzhong_1 = require("./standard/shu/huangzhong");
const liubei_1 = require("./standard/shu/liubei");
const liushan_1 = require("./standard/shu/liushan");
const machao_1 = require("./standard/shu/machao");
const menghuo_1 = require("./standard/shu/menghuo");
const pangtong_1 = require("./standard/shu/pangtong");
const weiyan_1 = require("./standard/shu/weiyan");
const wolong_1 = require("./standard/shu/wolong");
const zhangfei_1 = require("./standard/shu/zhangfei");
const zhaoyun_1 = require("./standard/shu/zhaoyun");
const zhugeliang_1 = require("./standard/shu/zhugeliang");
const zhurong_1 = require("./standard/shu/zhurong");
const caocao_1 = require("./standard/wei/caocao");
const caopi_1 = require("./standard/wei/caopi");
const caoren_1 = require("./standard/wei/caoren");
const dianwei_1 = require("./standard/wei/dianwei");
const guojia_1 = require("./standard/wei/guojia");
const simayi_2 = require("./standard/wei/simayi");
const xiahoudun_1 = require("./standard/wei/xiahoudun");
const xiahouyuan_1 = require("./standard/wei/xiahouyuan");
const xuchu_1 = require("./standard/wei/xuchu");
const xuhuang_1 = require("./standard/wei/xuhuang");
const xunyu_1 = require("./standard/wei/xunyu");
const yuejin_1 = require("./standard/wei/yuejin");
const zhanghe_1 = require("./standard/wei/zhanghe");
const zhangliao_1 = require("./standard/wei/zhangliao");
const zhenji_1 = require("./standard/wei/zhenji");
const daqiao_1 = require("./standard/wu/daqiao");
const dingfeng_1 = require("./standard/wu/dingfeng");
const ganning_1 = require("./standard/wu/ganning");
const huanggai_1 = require("./standard/wu/huanggai");
const lusu_1 = require("./standard/wu/lusu");
const luxun_1 = require("./standard/wu/luxun");
const lvmeng_1 = require("./standard/wu/lvmeng");
const sunjian_1 = require("./standard/wu/sunjian");
const sunquan_1 = require("./standard/wu/sunquan");
const sunshangxiang_1 = require("./standard/wu/sunshangxiang");
const taishici_1 = require("./standard/wu/taishici");
const xiaoqiao_1 = require("./standard/wu/xiaoqiao");
const zhangzhaozhanghong_1 = require("./standard/wu/zhangzhaozhanghong");
const zhoutai_1 = require("./standard/wu/zhoutai");
const zhouyu_1 = require("./standard/wu/zhouyu");
const peixiu_1 = require("./xljin/peixiu");
const simafu_1 = require("./xljin/simafu");
const simawang_1 = require("./xljin/simawang");
const simayan_1 = require("./xljin/simayan");
const simazhao_2 = require("./xljin/simazhao");
const wangyuanji_2 = require("./xljin/wangyuanji");
const wenyang_1 = require("./xljin/wenyang");
const zhanghua_1 = require("./xljin/zhanghua");
const wangjun_2 = require("./xljin/wangjun");
const hufen_1 = require("./xljin/hufen");
const xiahouhui_1 = require("./xljin/xiahouhui");
const wanghun_1 = require("./xljin/wanghun");
const zhongyan_1 = require("./xljin/zhongyan");
const tangbin_1 = require("./xljin/tangbin");
const huliehuyuan_1 = require("./xljin/huliehuyuan");
const liube_1 = require("./lords/liube");
const caohong_1 = require("./power/caohong");
const dengai_1 = require("./power/dengai");
const hetaihou_1 = require("./power/hetaihou");
const jiangqin_1 = require("./power/jiangqin");
const jiangwanfeiyi_1 = require("./power/jiangwanfeiyi");
const jiangwei_1 = require("./power/jiangwei");
const xusheng_1 = require("./power/xusheng");
const yuji_1 = require("./power/yuji");
const yanghu_1 = require("./jin/yanghu");
const duyu_1 = require("./jin/duyu");
const yanghu_2 = require("./xljin/yanghu");
const duyu_2 = require("./xljin/duyu");
const zhangjiao_2 = require("./lords/zhangjiao");
const chenwudongxi_1 = require("./power/chenwudongxi");
const dongzhuo_1 = require("./power/dongzhuo");
const lidian_1 = require("./power/lidian");
const madai_1 = require("./power/madai");
const mifuren_1 = require("./power/mifuren");
const sunce_1 = require("./power/sunce");
const zangba_1 = require("./power/zangba");
const zhangren_1 = require("./power/zhangren");
const zhanghuyuechen_1 = require("./jin/zhanghuyuechen");
const wenyang_2 = require("./jin/wenyang");
const weiguan_2 = require("./xljin/weiguan");
const zhouzhi_1 = require("./xljin/zhouzhi");
const sunquan_2 = require("./lords/sunquan");
const bianfuren_1 = require("./power/bianfuren");
const lijueguosi_1 = require("./power/lijueguosi");
const lingtong_1 = require("./power/lingtong");
const lvfan_1 = require("./power/lvfan");
const masu_1 = require("./power/masu");
const shamoke_1 = require("./power/shamoke");
const xunyou_1 = require("./power/xunyou");
const zuoci_1 = require("./power/zuoci");
const wangxiang_1 = require("./jin/wangxiang");
const baifuren_1 = require("./jin/baifuren");
const malong_2 = require("./xljin/malong");
const shantao_1 = require("./xljin/shantao");
const jishao_1 = require("./xljin/jishao");
const caocao_2 = require("./lords/caocao");
const cuiyanmaojie_1 = require("./power/cuiyanmaojie");
const fazheng_1 = require("./power/fazheng");
const lukang_1 = require("./power/lukang");
const wangping_1 = require("./power/wangping");
const wuguotai_1 = require("./power/wuguotai");
const yuanshu_1 = require("./power/yuanshu");
const yujin_1 = require("./power/yujin");
const zhangxiu_1 = require("./power/zhangxiu");
const yangjun_1 = require("./jin/yangjun");
const sunxiu_1 = require("./jin/sunxiu");
const simashi_2 = require("./xljin/simashi");
const yanghuiyu_2 = require("./xljin/yanghuiyu");
const simayi_3 = require("./lords/simayi");
const lord_simayan_1 = require("./xljin/lord_simayan");
const dengzhi_1 = require("./zongheng/dengzhi");
const fengxi_1 = require("./zongheng/fengxi");
const huaxin_1 = require("./zongheng/huaxin");
const luyusheng_1 = require("./zongheng/luyusheng");
const miheng_1 = require("./zongheng/miheng");
const xunchen_1 = require("./zongheng/xunchen");
const zongyu_1 = require("./zongheng/zongyu");
const yanghu_3 = require("./zongheng/yanghu");
const jiananfeng_1 = require("./zongheng/jiananfeng");
const luji_1 = require("./xljin/luji");
const luyun_1 = require("./xljin/luyun");
const wangxiang_2 = require("./xljin/wangxiang");
const xiahouhui_2 = require("./zongheng/xiahouhui");
const zhongyan_2 = require("./kangli/zhongyan");
const wanghun_2 = require("./kangli/wanghun");
const caozhi_1 = require("./kangli/caozhi");
const cuifei_1 = require("./kangli/cuifei");
const guansuo_1 = require("./kangli/guansuo");
const wangtaowangyue_1 = require("./kangli/wangtaowangyue");
const zhuju_1 = require("./kangli/zhuju");
const sunluyu_1 = require("./kangli/sunluyu");
const zhangze_1 = require("./kangli/zhangze");
const chenhuiqian_1 = require("./kangli/chenhuiqian");
const shichong_1 = require("./kangli/shichong");
const lvzhu_1 = require("./kangli/lvzhu");
const WarsDefaultGenerals = sgs.Package('WarsDefaultGenerals');
exports.WarsDefaultGenerals = WarsDefaultGenerals;
WarsDefaultGenerals.addGenerals([shibing_1.shibingn, shibing_1.shibingv]);
const WarsStandardGenerals = sgs.Package('WarsStandardGenerals');
exports.WarsStandardGenerals = WarsStandardGenerals;
//wei
WarsStandardGenerals.addGenerals([
    caocao_1.caocao,
    simayi_2.simayi,
    xiahoudun_1.xiahoudun,
    zhangliao_1.zhangliao,
    xuchu_1.xuchu,
    guojia_1.guojia,
    zhenji_1.zhenji,
    xiahouyuan_1.xiahouyuan,
    zhanghe_1.zhanghe,
    xuhuang_1.xuhuang,
    caoren_1.caoren,
    dianwei_1.dianwei,
    xunyu_1.xunyu,
    caopi_1.caopi,
    yuejin_1.yuejin,
]);
//shu
WarsStandardGenerals.addGenerals([
    liubei_1.liubei,
    guanyu_1.guanyu,
    zhangfei_1.zhangfei,
    zhugeliang_1.zhugeliang,
    zhaoyun_1.zhaoyun,
    machao_1.machao,
    huangyueying_1.huangyueying,
    huangzhong_1.huangzhong,
    weiyan_1.weiyan,
    pangtong_1.pangtong,
    wolong_1.wolong,
    liushan_1.liushan,
    menghuo_1.menghuo,
    zhurong_1.zhurong,
    ganfuren_1.ganfuren,
    huangzhong_1.huangzhong_v2025,
]);
//wu
WarsStandardGenerals.addGenerals([
    sunquan_1.sunquan,
    ganning_1.ganning,
    lvmeng_1.lvmeng,
    huanggai_1.huanggai,
    zhouyu_1.zhouyu,
    daqiao_1.daqiao,
    luxun_1.luxun,
    sunshangxiang_1.sunshangxiang,
    sunjian_1.sunjian,
    xiaoqiao_1.xiaoqiao,
    taishici_1.taishici,
    zhoutai_1.zhoutai,
    lusu_1.lusu,
    zhangzhaozhanghong_1.zhangzhaozhanghong,
    dingfeng_1.dingfeng,
    luxun_1.luxun_v2025,
]);
//qun
WarsStandardGenerals.addGenerals([
    huatuo_1.huatuo,
    lvbu_1.lvbu,
    diaochan_1.diaochan,
    yuanshao_1.yuanshao,
    yanliangwenchou_1.yanliangwenchou,
    jiaxu_1.jiaxu,
    pangde_1.pangde,
    zhangjiao_1.zhangjiao,
    caiwenji_1.caiwenji,
    mateng_1.mateng,
    kongrong_1.kongrong,
    jiling_1.jiling,
    tianfeng_1.tianfeng,
    panfeng_1.panfeng,
    zoushi_1.zoushi,
    jiling_1.jiling_v2025,
    panfeng_1.panfeng_v2025,
    tianfeng_1.tianfeng_v2025,
]);
//jin
WarsStandardGenerals.addGenerals([
    simayi_1.simayi_jin,
    zhangchunhua_1.zhangchunhua_jin,
    simashi_1.simashi,
    simazhao_1.simazhao,
    simazhou_1.simazhou,
    simaliang_1.simaliang,
    simalun_1.simalun,
    shibao_1.shibao,
    yanghuiyu_1.yanghuiyu,
    wangyuanji_1.wangyuanji,
    weiguan_1.weiguan,
    jiachong_1.jiachong,
    guohuai_1.guohuai_jin,
    wangjun_1.wangjun,
    malong_1.malong,
]);
//xljin
WarsStandardGenerals.addGenerals([
    simayan_1.simayan,
    simazhao_2.simazhao,
    wangyuanji_2.wangyuanji,
    wenyang_1.wenyang,
    simafu_1.simafu,
    simawang_1.simawang,
    zhanghua_1.zhanghua,
    peixiu_1.peixiu,
    wangjun_2.wangjun,
    hufen_1.hufen,
    xiahouhui_1.xiahouhui,
    wanghun_1.wanghun,
    zhongyan_1.zhongyan,
    tangbin_1.tangbin,
    huliehuyuan_1.huliehuyuan,
]);
const WarsPowerZhenGenerals = sgs.Package('WarsPowerZhenGenerals');
exports.WarsPowerZhenGenerals = WarsPowerZhenGenerals;
WarsPowerZhenGenerals.addGenerals([
    dengai_1.dengai,
    caohong_1.caohong,
    jiangwei_1.jiangwei,
    jiangwanfeiyi_1.jiangwanfeiyi,
    jiangqin_1.jiangqin,
    xusheng_1.xusheng,
    yuji_1.yuji,
    hetaihou_1.hetaihou,
    yanghu_1.yanghu,
    duyu_1.duyu,
    yanghu_2.yanghu,
    duyu_2.duyu,
]);
const WarsPowerShiGenerals = sgs.Package('WarsPowerShiGenerals');
exports.WarsPowerShiGenerals = WarsPowerShiGenerals;
WarsPowerShiGenerals.addGenerals([
    lidian_1.lidian,
    zangba_1.zangba,
    madai_1.madai,
    mifuren_1.mifuren,
    sunce_1.sunce,
    chenwudongxi_1.chenwudongxi,
    dongzhuo_1.dongzhuo,
    zhangren_1.zhangren,
    zhanghuyuechen_1.zhanghuyuechen,
    wenyang_2.wenyang,
    weiguan_2.weiguan,
    zhouzhi_1.zhouzhi,
]);
const WarsPowerBianGenerals = sgs.Package('WarsPowerBianGenerals');
exports.WarsPowerBianGenerals = WarsPowerBianGenerals;
WarsPowerBianGenerals.addGenerals([
    xunyou_1.xunyou,
    bianfuren_1.bianfuren,
    shamoke_1.shamoke,
    masu_1.masu,
    lingtong_1.lingtong,
    lvfan_1.lvfan,
    lijueguosi_1.lijueguosi,
    zuoci_1.zuoci,
    wangxiang_1.wangxiang,
    baifuren_1.baifuren,
    malong_2.malong,
    shantao_1.shantao,
    jishao_1.jishao,
]);
const WarsPowerQuanGenerals = sgs.Package('WarsPowerQuanGenerals');
exports.WarsPowerQuanGenerals = WarsPowerQuanGenerals;
WarsPowerQuanGenerals.addGenerals([
    cuiyanmaojie_1.cuiyanmaojie,
    yujin_1.yujin,
    wangping_1.wangping,
    fazheng_1.fazheng,
    wuguotai_1.wuguotai,
    lukang_1.lukang,
    zhangxiu_1.zhangxiu,
    yuanshu_1.yuanshu,
    yangjun_1.yangjun,
    sunxiu_1.sunxiu_jin,
    simashi_2.simashi,
    yanghuiyu_2.yanghuiyu,
]);
const WarsLordsGenerals = sgs.Package('WarsLordsGenerals');
exports.WarsLordsGenerals = WarsLordsGenerals;
WarsLordsGenerals.addGenerals([
    liube_1.lord_liubei,
    zhangjiao_2.lord_zhangjiao,
    sunquan_2.lord_sunquan,
    caocao_2.lord_caocao,
    simayi_3.lord_simayi,
    lord_simayan_1.lord_simayan,
]);
const WarsZonghengGenerals = sgs.Package('WarsZonghengGenerals');
exports.WarsZonghengGenerals = WarsZonghengGenerals;
WarsZonghengGenerals.addGenerals([
    yanghu_3.yanghu,
    huaxin_1.huaxin,
    zongyu_1.zongyu,
    dengzhi_1.dengzhi,
    fengxi_1.fengxi,
    luyusheng_1.luyusheng,
    miheng_1.miheng,
    xunchen_1.xunchen,
    wangxiang_2.xl_wangxiang,
    luji_1.luji_jin,
    luyun_1.luyun,
]);
const WarsKangLiGenerals = sgs.Package('WarsKangLiGenerals');
WarsKangLiGenerals.addGenerals([
    caozhi_1.caozhi,
    cuifei_1.cuifei,
    guansuo_1.guansuo,
    wangtaowangyue_1.wangtaowangyue,
    zhuju_1.zhuju,
    sunluyu_1.sunluyu,
    zhangze_1.zhangze,
    chenhuiqian_1.chenhuiqian,
    shichong_1.shichong,
    lvzhu_1.lvzhu,
]);
const WarsSpGenerals = sgs.Package('WarsSpGenerals');
WarsSpGenerals.addGenerals([jiananfeng_1.jiananfeng, xiahouhui_2.xiahouhui, zhongyan_2.zhongyan, wanghun_2.wanghun]);
sgs.loadTranslation({
    WarsDefaultGenerals: '国战标准',
    WarsStandardGenerals: '国战标准',
    WarsPowerZhenGenerals: '君临天下·阵',
    WarsPowerShiGenerals: '君临天下·势',
    WarsPowerBianGenerals: '君临天下·变',
    WarsPowerQuanGenerals: '君临天下·权',
    WarsLordsGenerals: '君临天下·君主',
    WarsZonghengGenerals: '纵横捭阖',
    WarsKangLiGenerals: '西凉·伉俪情深',
    WarsSpGenerals: '国战SP',
});
