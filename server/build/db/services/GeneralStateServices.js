"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralStatsService = void 0;
const __1 = require("..");
class GeneralStatsService {
    constructor() {
        this.collection = (0, __1.getDatabase)().collection('generals');
    }
    async processGameResult(matchResult) {
        const { mode } = matchResult;
        if (mode === 'wars_temp_jin' || mode === 'wars_temp_xl') {
            await this.processWarsGameResult(matchResult);
        }
    }
    async processWarsGameResult(matchResult) {
        const { mode, generals } = matchResult;
        const bulkOps = generals.map((data) => {
            const { generalId } = data;
            const update = this.buildBaseUpdate(mode, data);
            return {
                updateOne: {
                    filter: { generalId },
                    update: { ...update, $setOnInsert: { generalId } },
                    upsert: true,
                },
            };
        });
        await this.collection.bulkWrite(bulkOps);
        await this.calculate(matchResult);
    }
    buildBaseUpdate(mode, data) {
        const win = data.isWin ? 1 : 0;
        const update = {
            $set: { updateAt: new Date() },
            $inc: {},
        };
        if (data.isOffered) {
            update.$inc[`statsByMode.${mode}.offered`] = 1;
        }
        if (data.isInitialPick) {
            update.$inc[`statsByMode.${mode}.initialPicks`] = 1;
            update.$inc[`statsByMode.${mode}.initialPickWins`] = win;
            if (data.isHead) {
                update.$inc[`statsByMode.${mode}.asHead.initialPicks`] = 1;
                update.$inc[`statsByMode.${mode}.asHead.initialPickWins`] = win;
            }
            if (data.isDeputy) {
                update.$inc[`statsByMode.${mode}.asDeputy.initialPicks`] = 1;
                update.$inc[`statsByMode.${mode}.asDeputy.initialPickWins`] =
                    win;
            }
        }
        if (data.isChangePick) {
            update.$inc[`statsByMode.${mode}.changePicks`] = 1;
            update.$inc[`statsByMode.${mode}.changePickWins`] = win;
            if (data.isHead) {
                update.$inc[`statsByMode.${mode}.asHead.changePicks`] = 1;
                update.$inc[`statsByMode.${mode}.asHead.changePickWins`] = win;
            }
            if (data.isDeputy) {
                update.$inc[`statsByMode.${mode}.asDeputy.changePicks`] = 1;
                update.$inc[`statsByMode.${mode}.asDeputy.changePickWins`] =
                    win;
            }
        }
        if (data.isRemovals) {
            update.$inc[`statsByMode.${mode}.removals`] = 1;
            if (data.isHead) {
                update.$inc[`statsByMode.${mode}.asHead.removals`] = 1;
            }
            if (data.isDeputy) {
                update.$inc[`statsByMode.${mode}.asDeputy.removals`] = 1;
            }
        }
        //总胜利次数
        update.$inc[`statsByMode.${mode}.overallWins`] = win;
        if (data.isHead) {
            update.$inc[`statsByMode.${mode}.asHead.overallWins`] = win;
        }
        if (data.isDeputy) {
            update.$inc[`statsByMode.${mode}.asDeputy.overallWins`] = win;
        }
        return update;
    }
    async calculate(matchResult) {
        const { mode, generals } = matchResult;
        const datas = await this.collection
            .find({
            generalId: { $in: generals.map((v) => v.generalId) },
        })
            .toArray();
        const bulkOps = generals.map((general) => {
            const { generalId } = general;
            const data = datas.find((v) => v.generalId === generalId);
            const update = {};
            if (data && data.statsByMode[mode]) {
                const state = data.statsByMode[mode];
                if (state) {
                    //基础比率计算
                    const totalPicks = (state.initialPicks || 0) + (state.changePicks || 0);
                    if (state.offered && state.offered > 0) {
                        update[`statsByMode.${mode}.pickRate`] =
                            this.roundToTwoDecimal((state.initialPicks || 0) / state.offered);
                    }
                    if (state.initialPicks && state.initialPicks > 0) {
                        update[`statsByMode.${mode}.initialPickWinRate`] =
                            this.roundToTwoDecimal((state.initialPickWins || 0) /
                                state.initialPicks);
                    }
                    if (totalPicks > 0) {
                        update[`statsByMode.${mode}.winRate`] =
                            this.roundToTwoDecimal((state.overallWins || 0) / totalPicks);
                    }
                    //asHead
                    const asHead = state.asHead;
                    if (asHead) {
                        const totalPicks = (asHead.initialPicks || 0) +
                            (asHead.changePicks || 0);
                        if (state.offered && state.offered > 0) {
                            update[`statsByMode.${mode}.asHead.pickRate`] =
                                this.roundToTwoDecimal((asHead.initialPicks || 0) / state.offered);
                        }
                        if (asHead.initialPicks && asHead.initialPicks > 0) {
                            update[`statsByMode.${mode}.asHead.initialPickWinRate`] = this.roundToTwoDecimal((asHead.initialPickWins || 0) /
                                asHead.initialPicks);
                        }
                        if (totalPicks > 0) {
                            update[`statsByMode.${mode}.asHead.winRate`] =
                                this.roundToTwoDecimal((asHead.overallWins || 0) / totalPicks);
                        }
                    }
                    //asHead
                    const asDeputy = state.asDeputy;
                    if (asDeputy) {
                        const totalPicks = (asDeputy.initialPicks || 0) +
                            (asDeputy.changePicks || 0);
                        if (state.offered && state.offered > 0) {
                            update[`statsByMode.${mode}.asDeputy.pickRate`] =
                                this.roundToTwoDecimal((asDeputy.initialPicks || 0) / state.offered);
                        }
                        if (asDeputy.initialPicks &&
                            asDeputy.initialPicks > 0) {
                            update[`statsByMode.${mode}.asDeputy.initialPickWinRate`] = this.roundToTwoDecimal((asDeputy.initialPickWins || 0) /
                                asDeputy.initialPicks);
                        }
                        if (totalPicks > 0) {
                            update[`statsByMode.${mode}.asDeputy.winRate`] =
                                this.roundToTwoDecimal((asDeputy.overallWins || 0) / totalPicks);
                        }
                    }
                }
            }
            return {
                updateOne: {
                    filter: { generalId },
                    update: {
                        $set: {
                            updateAt: new Date(),
                            ...update,
                        },
                    },
                },
            };
        });
        await this.collection.bulkWrite(bulkOps);
    }
    /**
     * 四舍五入到小数点后两位
     * @param num 要处理的数字
     * @returns 保留两位小数的数字
     */
    roundToTwoDecimal(num) {
        return Math.round(num * 100) / 100;
    }
}
exports.GeneralStatsService = GeneralStatsService;
