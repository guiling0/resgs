"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bazhenzongshu_skill = exports.bazhenzongshu = exports.bazhenzongshu_lose = void 0;
exports.bazhenzongshu_lose = sgs.TriggerEffect({
    name: 'bazhenzongshu_lose',
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'bazhenzongshu' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const bazhenzongshu = data.getCard((d, c) => c.name === 'bazhenzongshu' && d.toArea === room.discardArea);
        const _data = data.get(bazhenzongshu);
        return {
            from: _data.player,
            cards: [bazhenzongshu],
        };
    },
    async cost(room, data, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});
exports.bazhenzongshu = sgs.CardUseEquip({
    name: 'bazhenzongshu',
    effects: [exports.bazhenzongshu_lose.name],
});
sgs.setCardData('bazhenzongshu', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'u',
});
exports.bazhenzongshu_skill = sgs.Skill({
    name: 'bazhenzongshu',
    attached_equip: 'bazhenzongshu',
});
const bazhenzongshu_skill_pool = [
    ['wars.caohong', 'wars.caohong.heyi'],
    ['wars.jiangwei', 'wars.jiangwei.tianfu'],
    ['wars.jiangqin', 'wars.jiangqin.niaoxiang'],
    ['wars.zhangren', 'wars.zhangren.fengshi'],
    ['xl.yanghu', 'xl.yanghu.chonge'],
    ['xl.wangtaowangyue', 'xl.wangtaowangyue.huyi'],
];
exports.bazhenzongshu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
            const _data = data.get(this.skill.sourceEquip);
            if (!_data)
                return false;
            return (_data.reason === 10 /* MoveCardReason.Obtain */ &&
                _data.toArea.player !== player);
        }
    },
    async cost(room, data, context) {
        return await data.cancle([this.skill.sourceEquip]);
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.removeCard({
            player: from,
            cards: [this.skill.sourceEquip],
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                if (this.player) {
                    const general = room.generalArea.generals.find((v) => bazhenzongshu_skill_pool.find((s) => s[0] === v.id));
                    if (general) {
                        room.generalArea.remove([general]);
                        this.player.handArea.add([general]);
                        const skill_name = bazhenzongshu_skill_pool.find((v) => v[0] === general.id)[1];
                        const skill = await room.addSkill(skill_name, this.player, {
                            source: `effect:${this.id}`,
                            showui: 'default',
                        });
                        this.setData('skill', skill);
                        this.player.setMark('bazhenzongshu', skill.name, {
                            visible: true,
                        });
                    }
                }
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                await this.getData('skill')?.removeSelf();
                this.player.removeMark('bazhenzongshu');
            },
        },
    ],
}));
exports.bazhenzongshu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const diaohulishan = room.createVirtualCardByNone('diaohulishan', undefined, false);
                diaohulishan.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.color === 2 /* CardColor.Black */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    diaohulishan.addSubCard(item);
                                if (type === 'remove')
                                    diaohulishan.delSubCard(item);
                                diaohulishan.set();
                                this._use_or_play_vcard = diaohulishan;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '八阵总述：你可以将一张黑色牌当【调虎离山】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            player.hp > 0 &&
            data.from === player &&
            data.has('diaohulishan')) {
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 1;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.losehp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
