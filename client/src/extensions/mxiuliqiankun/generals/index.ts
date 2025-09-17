import { Gender } from '../../../core/general/general.type';
import { cs_bilan } from './shichangshi/bilan';
import { cs_duangui } from './shichangshi/duangui';
import { cs_gaowang } from './shichangshi/gaowang';
import { cs_guosheng } from './shichangshi/guosheng';
import { cs_hankui } from './shichangshi/hankui';
import { cs_lisong } from './shichangshi/lisong';
import { shichangshi } from './shichangshi/shichangshi';
import { cs_sunzhang } from './shichangshi/sunzhang';
import { cs_xiayun } from './shichangshi/xiayun';
import { cs_zhangrang } from './shichangshi/zhangrang';
import { cs_zhaozhong } from './shichangshi/zhaozhong';

export const MobileXiuLiQianKun = sgs.Package('MobileExclusive.XiuLiQianKun');

MobileXiuLiQianKun.addGenerals([
    shichangshi,
    cs_zhangrang,
    cs_zhaozhong,
    cs_sunzhang,
    cs_bilan,
    cs_xiayun,
    cs_hankui,
    cs_lisong,
    cs_duangui,
    cs_guosheng,
    cs_gaowang,
]);
