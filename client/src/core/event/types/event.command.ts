import { CardPut } from '../../card/card.types';
import { RequestOptionData } from '../../choose/choose.types';
import { GamePlayer } from '../../player/player';
import { EventData } from '../data';
import { EventProcess } from '../event';
import { DamageEvent, LoseHpEvent } from './event.damage';
import { MoveCardEvent } from './event.move';
import { SkipEvent } from './event.state';

/**
 * 军令事件
 */
export class CommandData extends EventProcess {
    /** 军令发起者*/
    from: GamePlayer;
    /** 军令执行者 */
    to: GamePlayer;
    /** 备选军令 如果不提供则随机抽取两张军令 */
    selectable: number[];
    /** 选中的军令 如果不提供将会让from根据备选军令进行选择 */
    command: number;
    /** 是否执行了 */
    execute: boolean = false;
    /** 发起的选择的设置 */
    reqOptions: RequestOptionData;

    //以下是军令中可能触发的事件
    damage?: DamageEvent;
    moves?: MoveCardEvent[] = [];
    lose?: LoseHpEvent;
    skip?: SkipEvent;

    protected async init(): Promise<void> {
        if (!this.selectable && !this.command) {
            this.selectable = this.room.getCommands(2);
        }
        if (!this.command && this.from) {
            this.command = await this.room.chooseCommand(
                this.from,
                this.selectable,
                this.reqOptions
            );
        }
        if (!this.command) return;
        this.room.insertHistory(this);
        let yes = false;
        if (!this.execute) {
            const req = await this.room.doRequest({
                player: this.to,
                get_selectors: {
                    selectorId:
                        this.room.base_selectors.getSelectorName(
                            'choose_command_yon'
                        ),
                    context: { command: this.command },
                },
            });
            if (req) {
                const result = this.room.getResult(req, 'option')
                    .result as string[];
                if (result.includes('yes')) yes = true;
            }
        } else {
            yes = true;
        }
        if (yes) {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: '#ChooseJunling_Yes',
                    values: [{ type: 'player', value: this.to.playerId }],
                },
            });
            this.execute = true;
            if (this.command === 1) {
                const damage = await this.room.doRequest({
                    player: this.from,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_1'
                            ),
                        context: {},
                    },
                });
                const target = this.room.getResultPlayers(damage).at(0);
                this.damage = await this.room.damage({
                    from: this.to,
                    to: target,
                    source: this,
                    reason: 'junling',
                });
            }
            if (this.command === 2) {
                this.moves.push(
                    await this.room.drawCards({
                        player: this.to,
                        source: this,
                        reason: 'junling',
                    })
                );
                const give = await this.room.doRequest({
                    player: this.to,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_2'
                            ),
                        context: { from: this.to },
                    },
                });
                const cards = this.room.getResultCards(give);
                this.moves.push(
                    await this.room.giveCards({
                        from: this.to,
                        to: this.from,
                        cards,
                        source: this,
                        reason: 'junling',
                    })
                );
            }
            if (this.command === 3) {
                this.lose = await this.room.losehp({
                    player: this.to,
                    source: this,
                    reason: 'junling',
                });
            }
            if (this.command === 4) {
                await this.room.addEffect('junling4.effect', this.to);
            }
            if (this.command === 5) {
                this.skip = await this.room.skip({
                    player: this.to,
                    source: this,
                    reason: 'junling',
                });
                await this.room.addEffect('junling5.effect', this.to);
            }
            if (this.command === 6) {
                let count = 0;
                if (this.to.getHandCards().length > 0) count++;
                if (this.to.getEquipCards().length > 0) count++;
                if (count > 0) {
                    const drop = await this.room.doRequest({
                        player: this.to,
                        get_selectors: {
                            selectorId:
                                this.room.base_selectors.getSelectorName(
                                    'choose_command_6'
                                ),
                            context: { from: this.to },
                        },
                    });
                    const cards = this.room.getResultCards(drop);
                    const d_cards = this.to
                        .getSelfCards()
                        .filter((v) => !cards.includes(v));
                    this.moves.push(
                        await this.room.dropCards({
                            player: this.to,
                            cards: d_cards,
                            source: this,
                            reason: 'junling',
                        })
                    );
                }
            }
        }
        if (!yes) {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: '#ChooseJunling_No',
                    values: [{ type: 'player', value: this.to.playerId }],
                },
            });
            this.execute = false;
        }
    }

    public check(): boolean {
        if (!this.from && !this.command) return false;
        if (this.from && this.from.death) return false;
        if (this.to && this.to.death) return false;
        return true;
    }
}

/**
 * 妙计事件
 */
export class MiaoJiData extends EventProcess {
    /** 献策来源 */
    sourceFrom?: GamePlayer;
    /** 军令发起者 */
    from: GamePlayer;
    /** 军令执行者 */
    to: GamePlayer;
    /** 选中的军令 如果不提供将会让from根据备选军令进行选择 */
    command: number;
    /** 是否执行了 */
    execute: boolean = false;
    /** 发起的选择的设置 */
    reqOptions: RequestOptionData;

    //以下是军令中可能触发的事件
    damage?: DamageEvent;
    moves?: MoveCardEvent[] = [];
    lose?: LoseHpEvent;
    skip?: SkipEvent;

    protected async init(): Promise<void> {
        if (!this.command) {
            this.command = this.room.getMiaoji().at(0);
        }
        if (!this.command) return;
        this.room.insertHistory(this);
        if (this.sourceFrom && this.from) {
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [this.command],
                        fromArea: this.sourceFrom.handArea.areaId,
                        toArea: this.from.upArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '{0}',
                            values: [{ type: 'string', value: this.reason }],
                        },
                    },
                ],
                log: {
                    text: '#XianCe',
                    values: [
                        { type: 'player', value: this.sourceFrom.playerId },
                        { type: 'player', value: this.from.playerId },
                        {
                            type: 'string',
                            value: `#junling${this.command}`,
                        },
                    ],
                },
            });
            return;
        }
        let yes = false;
        if (!this.execute) {
            const req = await this.room.doRequest({
                player: this.to,
                get_selectors: {
                    selectorId:
                        this.room.base_selectors.getSelectorName(
                            'choose_command_yon'
                        ),
                    context: { command: this.command },
                },
            });
            const result = this.room.getResult(req, 'option')
                .result as string[];
            if (result.includes('yes')) yes = true;
        } else {
            yes = true;
        }
        if (yes) {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: '#ChooseXianCe_Yes',
                    values: [
                        { type: 'player', value: this.from.playerId },
                        { type: 'player', value: this.to.playerId },
                        {
                            type: 'string',
                            value: `#junling${this.command}`,
                        },
                    ],
                },
            });
            this.execute = true;
            //造成1点伤害
            if (this.command === 80) {
                const damage = await this.room.doRequest({
                    player: this.from,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_80'
                            ),
                        context: {},
                    },
                });
                const target = this.room.getResultPlayers(damage).at(0);
                this.damage = await this.room.damage({
                    from: this.to,
                    to: target,
                    source: this,
                    reason: 'miaoji',
                });
            }
            //摸1给2
            if (this.command === 81) {
                this.moves.push(
                    await this.room.drawCards({
                        player: this.to,
                        source: this,
                        reason: 'miaoji',
                    })
                );
                const give = await this.room.doRequest({
                    player: this.to,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_2'
                            ),
                        context: { from: this.to },
                    },
                });
                const cards = this.room.getResultCards(give);
                this.moves.push(
                    await this.room.giveCards({
                        from: this.to,
                        to: this.from,
                        cards,
                        source: this,
                        reason: 'miaoji',
                    })
                );
            }
            //失去1点体力
            if (this.command === 82) {
                this.lose = await this.room.losehp({
                    player: this.to,
                    source: this,
                    reason: 'miaoji',
                });
            }
            //不能使用打出手牌；属性伤害+1
            if (this.command === 83) {
                await this.room.addEffect('miaoji4.effect', this.to);
                await this.room.addEffect('miaoji4.effect.damage', this.to);
            }
            //非锁定技失效；回复体力后弃置两张牌
            if (this.command === 84) {
                await this.room.addEffect('miaoji5.effect', this.to);
                await this.room.addEffect('miaoji5.effect.recover', this.to);
            }
            //弃置一张牌横置
            if (this.command === 85) {
                const drop = await this.room.doRequest({
                    player: this.to,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_85'
                            ),
                        context: { from: this.to },
                    },
                });
                const cards = this.room.getResultCards(drop);
                this.moves.push(
                    await this.room.dropCards({
                        player: this.to,
                        cards,
                        source: this,
                        reason: 'miaoji',
                    })
                );
                if (!this.to.chained) {
                    await this.room.chain({
                        player: this.to,
                        to_state: true,
                        source: this,
                        reason: 'miaoji',
                    });
                }
            }
            //保留一张手牌和装备
            if (this.command === 86) {
                let count = 0;
                if (this.to.getHandCards().length > 0) count++;
                if (this.to.getEquipCards().length > 0) count++;
                if (count > 0) {
                    const drop = await this.room.doRequest({
                        player: this.to,
                        get_selectors: {
                            selectorId:
                                this.room.base_selectors.getSelectorName(
                                    'choose_command_86'
                                ),
                            context: { from: this.to },
                        },
                    });
                    const cards = this.room.getResultCards(drop);
                    const d_cards = this.to
                        .getSelfCards()
                        .filter((v) => !cards.includes(v));
                    this.moves.push(
                        await this.room.dropCards({
                            player: this.to,
                            cards: d_cards,
                            source: this,
                            reason: 'miaoji',
                        })
                    );
                }
            }
            //弃置一张锦囊牌或者两张牌
            if (this.command === 87) {
                const drop = await this.room.doRequest({
                    player: this.to,
                    get_selectors: {
                        selectorId:
                            this.room.base_selectors.getSelectorName(
                                'choose_command_87'
                            ),
                        context: { from: this.to },
                    },
                });
                const cards = this.room.getResultCards(drop);
                this.moves.push(
                    await this.room.dropCards({
                        player: this.to,
                        cards,
                        source: this,
                        reason: 'miaoji',
                    })
                );
            }
            //受到1点伤害
            if (this.command === 88) {
                this.damage = await this.room.damage({
                    from: this.from,
                    to: this.to,
                    source: this,
                    reason: 'miaoji',
                });
            }
            //展示所有手牌并弃置一张
            if (this.command === 89) {
                await this.room.showCards({
                    player: this.to,
                    cards: this.to.getHandCards(),
                    source: this,
                    reason: 'miaoji',
                });
                if (this.to.hasCanDropCards('h', this.from, 1, 'miaoji')) {
                    sgs.DataType.WatchHandData.temp(
                        this.from,
                        this.to.getHandCards()
                    );
                    const drop = await this.room.doRequest({
                        player: this.from,
                        get_selectors: {
                            selectorId:
                                this.room.base_selectors.getSelectorName(
                                    'choose_command_89'
                                ),
                            context: { from: this.from },
                        },
                    });
                    const cards = this.room.getResultCards(drop);
                    this.moves.push(
                        await this.room.dropCards({
                            player: this.from,
                            cards,
                            source: this,
                            reason: 'miaoji',
                        })
                    );
                }
            }
            //重铸所有手牌
            if (this.command === 90) {
                const hand = this.to.getHandCards().length;
                if (hand > 0) {
                    if (this.to.getHandCards().length <= 3) {
                        await this.room.recastCards({
                            player: this.to,
                            cards: this.to.getHandCards(),
                            source: this,
                            reason: 'miaoji',
                        });
                    } else {
                        const req = await this.room.doRequest({
                            player: this.to,
                            get_selectors: {
                                selectorId:
                                    this.room.base_selectors.getSelectorName(
                                        'choose_command_90'
                                    ),
                                context: { from: this.to },
                            },
                        });
                        const cards = this.room.getResultCards(req);
                        await this.room.recastCards({
                            player: this.to,
                            cards,
                            source: this,
                            reason: 'miaoji',
                        });
                    }
                    if (this.to.hasCanDropCards('h', this.to, 1, 'miaoji')) {
                        const req = await this.room.doRequest({
                            player: this.to,
                            get_selectors: {
                                selectorId:
                                    this.room.base_selectors.getSelectorName(
                                        'choose_command_90_1'
                                    ),
                                context: { from: this.to },
                            },
                        });
                        const cards = this.room.getResultCards(req);
                        await this.room.dropCards({
                            player: this.to,
                            cards,
                            source: this,
                            reason: 'miaoji',
                        });
                    }
                }
            }
            //收回装备牌
            if (this.command === 91) {
                await this.room.obtainCards({
                    player: this.to,
                    cards: this.to.getEquipCards(),
                    source: this,
                    reason: 'miaoji',
                });
                if (this.to.hasCanDropCards('h', this.to, 1, 'miaoji')) {
                    const req = await this.room.doRequest({
                        player: this.to,
                        get_selectors: {
                            selectorId:
                                this.room.base_selectors.getSelectorName(
                                    'choose_command_91'
                                ),
                            context: { from: this.to },
                        },
                    });
                    const cards = this.room.getResultCards(req);
                    await this.room.dropCards({
                        player: this.to,
                        cards,
                        source: this,
                        reason: 'miaoji',
                    });
                }
            }
        }
        if (!yes) {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: '#ChooseJunling_No',
                    values: [{ type: 'player', value: this.to.playerId }],
                },
            });
            this.execute = false;
        }
        this.room.miaojis.push(this.command);
    }

    public check(): boolean {
        if (!this.from && !this.command) return false;
        if (this.from && this.from.death) return false;
        if (this.to && this.to.death) return false;
        return true;
    }
}
