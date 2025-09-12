"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lianjunshengyan = exports.lianjunshengyan_choose = void 0;
exports.lianjunshengyan_choose = sgs.TriggerEffect({
    name: 'lianjunshengyan_choose',
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const length = context.length;
                const max = Math.min(length, from.losshp);
                const options = [];
                for (let i = 0; i <= max; i++) {
                    options.push(i.toString());
                }
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: `联军盛宴：请选择回复体力的数值。剩余的值为摸牌数（总数：${length}）`,
                        thinkPrompt: '联军盛宴',
                    },
                };
            },
        };
    },
});
exports.lianjunshengyan = sgs.CardUse({
    name: 'lianjunshengyan',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.lianjunshengyan_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [2, -1],
            filter(item, selected) {
                if (selected.length === 0) {
                    return room.differentAsKingdom(from, item);
                }
                else if (selected.length === 1) {
                    return item === from;
                }
                else {
                    return room.sameAsKingdom(selected[0], item);
                }
            },
            onChange(type, item, selected) {
                if (type === 'add' && selected.length === 1) {
                    this.selectors.target.auto_func();
                }
            },
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        if (current.target === from) {
            const length = data.targets.length - 1;
            const s = room.getData('lianjunshengyan_choose');
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: s.getSelectorName('choose'),
                    context: { from, length },
                },
            });
            let count = Number(room.getResult(req, 'option').result.at(0));
            await room.drawCards({
                player: from,
                count: length - count,
                source: data,
                reason: this.name,
            });
            await room.recoverhp({
                player: from,
                number: count,
                source: data,
                reason: this.name,
            });
        }
        else {
            await room.drawCards({
                player: current.target,
                source: data,
                reason: this.name,
            });
            await room.chain({
                player: current.target,
                to_state: false,
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('lianjunshengyan', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'an',
    recover: true,
});
