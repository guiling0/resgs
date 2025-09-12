"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileXiuLiQianKun = void 0;
const bilan_1 = require("./shichangshi/bilan");
const duangui_1 = require("./shichangshi/duangui");
const gaowang_1 = require("./shichangshi/gaowang");
const guosheng_1 = require("./shichangshi/guosheng");
const hankui_1 = require("./shichangshi/hankui");
const lisong_1 = require("./shichangshi/lisong");
const shichangshi_1 = require("./shichangshi/shichangshi");
const sunzhang_1 = require("./shichangshi/sunzhang");
const xiayun_1 = require("./shichangshi/xiayun");
const zhangrang_1 = require("./shichangshi/zhangrang");
const zhaozhong_1 = require("./shichangshi/zhaozhong");
exports.MobileXiuLiQianKun = sgs.Package('MobileXiuLiQianKun');
exports.MobileXiuLiQianKun.addGenerals([
    shichangshi_1.shichangshi,
    zhangrang_1.cs_zhangrang,
    zhaozhong_1.cs_zhaozhong,
    sunzhang_1.cs_sunzhang,
    bilan_1.cs_bilan,
    xiayun_1.cs_xiayun,
    hankui_1.cs_hankui,
    lisong_1.cs_lisong,
    duangui_1.cs_duangui,
    guosheng_1.cs_guosheng,
    gaowang_1.cs_gaowang,
]);
