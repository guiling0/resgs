import { GameCard } from '../../core/card/card';
import { CardAttr } from '../../core/card/card.types';
import { ContextJsonData } from '../../core/choose/choose.json';
import {
    ChooseData,
    GameRequest,
    PlayPhaseResule,
} from '../../core/choose/choose.types';
import { CustomString } from '../../core/custom/custom.type';
import { EventTriggers } from '../../core/event/triggers';
import { GamePlayer } from '../../core/player/player';
import { TriggerEffect } from '../../core/skill/effect';
import { UICard } from '../../ui/UICard';
import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { UIOptionButton } from '../../ui/UIOptionButton';
import { UISkillButton } from '../../ui/UISkillButton';
import { RoomGameComp } from '../room/RoomGameComp';
import {
    ChooseCardComp,
    ChooseCommandComp,
    ChooseGeneralComp,
    ChooseOptionComp,
    ChoosePlayerComp,
    ChooseVCardComp,
} from './ChooseChildComp';
import { ScriptChooseComp } from './ScriptChooseComp';

const { regClass, property } = Laya;

@regClass()
export class GameChooseComp extends Laya.Script {
    public declare owner: UIGameRoom;

    public game: RoomGameComp;
    public originalRequest: GameRequest; // 保存原始请求

    public get player() {
        return this.game?.selfComp;
    }

    public request: GameRequest;
    public childs: { [key: string]: ScriptChooseComp<any, any> } = {};

    onAwake(): void {
        this.game = this.owner.getComponent(RoomGameComp);

        this.owner.selfseat.confirm.on(
            Laya.Event.CLICK,
            this,
            this.onConfirmClick
        );
        this.owner.selfseat.cancle.on(
            Laya.Event.CLICK,
            this,
            this.onCancleClick
        );
        this.owner.selfseat.recast.on(
            Laya.Event.CLICK,
            this,
            this.onRecastClick
        );
        this.owner.selfseat.end.on(Laya.Event.CLICK, this, this.onEndClick);
        this.owner.wuxie.on(Laya.Event.CLICK, this, () => {
            this.onCancleClick();
            this.game.room.send('skip_wuxie', {});
            this.owner.wuxie.visible = false;
        });
    }

    onDestroy(): void {
        this.end();
        this.owner.selfseat.confirm.off(
            Laya.Event.CLICK,
            this,
            this.onConfirmClick
        );
        this.owner.selfseat.cancle.off(
            Laya.Event.CLICK,
            this,
            this.onCancleClick
        );
        this.owner.selfseat.recast.off(
            Laya.Event.CLICK,
            this,
            this.onRecastClick
        );
        this.owner.selfseat.end.off(Laya.Event.CLICK, this, this.onEndClick);
    }

    start(request: GameRequest) {
        this.request = request;
        this.game.card.markskills(false);
        // 如果是第一次请求，保存为原始请求
        if (!this.originalRequest) {
            this.originalRequest = request;
            this.game.renderSkill();
        }

        //代理prompt的修改
        let _prompt: CustomString = request.options?.prompt ?? '';
        Reflect.defineProperty(request.options, 'prompt', {
            set: (v: CustomString) => {
                _prompt = v;
                this.game.selfComp.owner.prompt.text =
                    this.game.getTranslation(v);
            },
            get: () => {
                return _prompt;
            },
        });
        request.options.prompt = _prompt;

        //skills
        const skills = request.get_selectors.context.can_use_skills as {
            selectorId: string;
            context: ContextJsonData;
        }[];
        if (skills) {
            const reqs: GameRequest[] = skills.map((v) => {
                let req: GameRequest = {
                    id: request.id,
                    player: request.player,
                    room: request.room,
                    get_selectors: {
                        selectorId: v.selectorId,
                        context: {
                            ...this.game.game.toData_Context(v.context),
                            // 保留原始技能的可用性信息
                            can_use_skills:
                                request.get_selectors.context.can_use_skills,
                        },
                    },
                    complete: false,
                    timeout: false,
                    result: {
                        cancle: false,
                        use_or_play_card: undefined,
                        selected_skill: undefined,
                        playphase: PlayPhaseResule.End,
                        results: {},
                        sort_result: undefined,
                    },
                };
                this.game.game.fillRequest(req);
                req.options.isPlayPhase = request.options.isPlayPhase;
                return req;
            });

            this.game.skills.forEach((v) => {
                if (!v.skill) return;
                v.item.onClick(undefined);
                if (
                    v instanceof UIEquipSelf &&
                    this.skill_ui &&
                    this.skill_ui !== v
                ) {
                    return;
                }
                let handles: string[] = [];
                reqs.forEach((u) => {
                    const effect = u.get_selectors.context.effect;
                    if (!effect) return;
                    if (effect && effect.skill && effect.skill === v.skill) {
                        handles.push(effect.data.name);
                    }
                    if (
                        v.skill.hasLockEffect() &&
                        this.request.options.isPlayPhase &&
                        !v.skill.isOpen()
                    ) {
                        const player = this.request.player;
                        const generals = player.getCanOpenGenerals();
                        if (
                            v.skill.sourceGeneral === player.head &&
                            generals.includes(v.skill.sourceGeneral) &&
                            !handles.includes('#playphase_open_head')
                        ) {
                            handles.push('#playphase_open_head');
                        }
                        if (
                            v.skill.sourceGeneral === player.deputy &&
                            generals.includes(v.skill.sourceGeneral) &&
                            !handles.includes('#playphase_open_deputy')
                        ) {
                            handles.push('#playphase_open_deputy');
                        }
                    }
                    if (v.skill.canPreshow() && !v.skill.isOpen()) {
                        const to = v.skill.preshow
                            ? '#canclePreshow'
                            : '#preshow';
                        if (!handles.includes(to)) {
                            handles.push(to);
                        }
                    }
                    if (handles.length > 0) {
                        v.item.setCanClick(true);
                        v.item.onClick(() => {
                            this.onSkillButtonClick(v, handles, reqs);
                            if (v.skill && v.skill.options.showui === 'mark') {
                                //关闭标记面板
                                this.game.card.markskills(false);
                            }
                        });
                    }
                });
            });
        }

        this.owner.selfseat.buttons.visible = true;
        if (request.options.showMainButtons ?? true) {
            this.owner.selfseat.confirm.visible = true;
            this.owner.selfseat.cancle.visible = true;
        }
        if (request.options.isPlayPhase) {
            this.owner.selfseat.end.visible = true;
        }
        Object.keys(request.selectors).forEach((v) => {
            if (request.selectors[v]) {
                request.selectors[v].result = [];
            }
        });
        this.owner.selfseat.confirm.mouseEnabled = false;
        this.owner.selfseat.confirm.grayed = true;
        if ((request as any).isWuxie) {
            this.owner.wuxie.visible = true;
        } else {
            this.owner.wuxie.visible = false;
        }
        this.owner.frameOnce(1, this, () => {
            this.next();
        });
    }

    end() {
        this.clearAllChild();
        this.request = undefined;
        this.originalRequest = undefined; // 清除原始请求
        this.skill_ui = undefined;
        this.owner.selfseat.prompt.text = '';
    }

    private lastCallTime: number = 0;

    next() {
        if (!this.request) return;

        // const now = Date.now();
        // // 节流控制，至少间隔16ms(约60fps)才执行一次
        // if (now - this.lastCallTime < 16) {
        //     return;
        // }
        // this.lastCallTime = now;

        //刷新一次技能按钮
        this.game.skills.forEach((v) => {
            if (
                v instanceof UIEquipSelf &&
                // this.skill &&
                this.skill_ui === v
            ) {
                return;
            }
            if (v.item.canClick) {
                v.item.setSelected(this.skill_ui === v, this.skill_ui === v);
            }
        });
        this.game.card.refreshHandCards();
        this.game.card.refreshEquipCards();

        //child
        const keys = Object.keys(this.request.selectors).sort((a, b) => {
            return (
                this.request.selectors[a]?.step -
                this.request.selectors[b]?.step
            );
        });
        const childs = Object.values(this.childs);
        childs.forEach((v) => (v.handled = false));
        //child next
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = keys[i];
            let comp = this.childs[key];
            const data = this.request.selectors[key];
            if (!data) {
                if (comp && !comp.destroyed) {
                    comp.destroy();
                    delete this.childs[key];
                }
                continue;
            }
            if (!data.result) {
                data.result = [];
            }
            if (!comp || comp.destroyed) {
                comp = this.addComponent(key, data);
            }
            if (comp.data !== data) {
                data.result = [];
                comp.init(data);
            }
            comp.handled = true;
            if (i === 0) {
                comp.enable = true;
            } else {
                const last = this.childs[keys[i - 1]];
                comp.enable = last.enable && last.isok();
            }
            comp.refresh();
            if (!comp.isok()) {
                break;
            }
        }

        childs.forEach((v) => {
            if (!v.handled) {
                // 只在需要时销毁组件
                if (!v.destroyed) {
                    v.destroy();
                }
            }
        });

        // 统一计算UI状态，减少DOM操作
        let recastVisible = false;
        let confirmEnabled = false;
        let cancelEnabled = false;

        // 计算recast按钮可见性
        if (this.request.options.isPlayPhase) {
            const card =
                (this.request.selectors?.card?.result as GameCard[]) ?? [];
            const targets =
                (this.request.selectors?.target?.result as GamePlayer[]) ?? [];
            recastVisible =
                card.length === 1 &&
                card[0].hasAttr?.(CardAttr.Recastable) &&
                targets.length === 0;
        }

        // 计算confirm按钮状态
        confirmEnabled =
            keys.every((v) => this.childs[v]?.isok()) && !recastVisible;

        // 计算cancel按钮状态
        cancelEnabled = this.request.options.isPlayPhase
            ? keys.some((v) => this.childs[v]?.result.length > 0) ||
              this.originalRequest !== this.request
            : this.request.options.canCancle;

        // 批量更新UI状态，减少重绘
        if (this.owner.selfseat.recast.visible !== recastVisible) {
            this.owner.selfseat.recast.visible = recastVisible;
        }

        if (this.owner.selfseat.confirm.mouseEnabled !== confirmEnabled) {
            this.owner.selfseat.confirm.mouseEnabled = confirmEnabled;
            this.owner.selfseat.confirm.grayed = !confirmEnabled;
        }

        if (this.owner.selfseat.cancle.mouseEnabled !== cancelEnabled) {
            this.owner.selfseat.cancle.mouseEnabled = cancelEnabled;
            this.owner.selfseat.cancle.grayed = !cancelEnabled;
        }

        // 自动确认逻辑优化
        const shouldAutoConfirm =
            this.owner.selfseat.confirm.visible === false &&
            keys.every((v) => this.request.selectors[v].complete);

        if (shouldAutoConfirm) {
            this.onConfirmClick();
        }
    }

    addComponent(key: string, data: ChooseData) {
        let comp: ScriptChooseComp<any, any>;
        if (data.type === 'card')
            comp = this.owner.addComponent(ChooseCardComp);
        if (data.type === 'general')
            comp = this.owner.addComponent(ChooseGeneralComp);
        if (data.type === 'player')
            comp = this.owner.addComponent(ChoosePlayerComp);
        if (data.type === 'option')
            comp = this.owner.addComponent(ChooseOptionComp);
        if (data.type === 'vcard')
            comp = this.owner.addComponent(ChooseVCardComp);
        if (data.type === 'command')
            comp = this.owner.addComponent(ChooseCommandComp);
        this.childs[key] = comp;
        //处理一下options
        data.windowOptions = data.windowOptions || {};
        data.windowOptions.timebar =
            this.request.options.ms ?? this.game.game.responseTime;
        data.windowOptions.buttons = data.windowOptions.buttons ?? [];
        lodash.remove(data.windowOptions.buttons, (v) => v === 'cancle');
        if (data.selecte_type && data.selecte_type !== 'self')
            this.game.selfComp.endCountDown();
        comp.init(data);
        return comp;
    }

    clearAllChild() {
        Object.keys(this.childs).forEach((v) => {
            this.childs[v].data?.onChange?.call(this.request, 'complete');
            this.childs[v].destroy();
        });
        this.childs = {};
        this.owner.selfseat.confirm.visible = false;
        this.owner.selfseat.cancle.visible = false;
        this.owner.selfseat.end.visible = false;
        this.owner.selfseat.recast.visible = false;
        this.owner.selfseat.buttons.visible = false;
        this.owner.selfseat.prompt.text = ``;

        this.game.players.forEach((v) => {
            v.owner.item.onClick(undefined);
            v.owner.item.setCanClick(true);
            v.owner.item.setSelected(false);
        });

        this.game.skills.forEach((v) => {
            v.item.setSelected(false);
            v.item.onClick(undefined);
            v.item.setCanClick(false);
        });
        this.game.renderSkill();
        this.game.card.refreshEquipCards();
    }

    onConfirmClick() {
        if (this.request.result.selected_skill) {
            this.request.result.playphase = PlayPhaseResule.UseSkill;
        }
        if (this.request._use_or_play_vcard) {
            this.request.result.use_or_play_card =
                this.request._use_or_play_vcard.vdata;
        }
        if (this.request.options.isPlayPhase) {
            if (this.request._use_or_play_vcard) {
                this.request.result.playphase = PlayPhaseResule.UseCard;
            }
        }
        const sort = Object.keys(this.request.selectors).find(
            (v) =>
                this.request.selectors[v].type === 'card' &&
                this.request.selectors[v].selecte_type === 'drags'
        );
        if (sort) {
            this.request.result.sort_result = this.request.selectors[
                sort
            ].data_items.map((v) => {
                return {
                    title: v.title,
                    items: v.items
                        .map((i) => (i.card as any)?.id)
                        .filter((c) => c),
                };
            });
        }

        this.game.response(this.request);
    }

    onRecastClick() {
        if (this.request.options.isPlayPhase) {
            this.request.result.playphase = PlayPhaseResule.Recast;
            this.game.response(this.request);
        }
    }

    onCancleClick() {
        if (this.skill_ui) {
            this.onSkillButtonClick(this.skill_ui, [], undefined);
        }
        if (this.request.options.isPlayPhase) {
            this.clearAllChild();
            this.start(this.originalRequest); // 总是回到最初请求状态
        } else {
            this.request.result.cancle = true;
            Object.keys(this.request.selectors).forEach((v) => {
                if (this.request.selectors[v]) {
                    this.request.selectors[v].result = [];
                }
            });
            this.game.response(this.request);
        }
    }

    onEndClick() {
        if (this.request.options.isPlayPhase) {
            this.request.result.cancle = true;
            this.request.result.playphase = PlayPhaseResule.End;
            Object.keys(this.request.selectors).forEach((v) => {
                if (this.request.selectors[v]) {
                    this.request.selectors[v].result = [];
                }
            });
            this.game.response(this.request);
        }
    }

    //当前选中的技能对应的按钮
    skill_ui: UISkillButton | UIEquipSelf | UICard;

    onSkillButtonClick(
        ui: UISkillButton | UIEquipSelf | UICard,
        handles: string[],
        reqs: GameRequest[]
    ) {
        // 确保按钮始终保持可点击状态
        if (ui.item) {
            ui.item.setCanClick(true);
        }

        // 如果点击的是当前已选中的技能
        if (this.skill_ui === ui) {
            // 取消选中当前技能（反选）
            if (ui.item && ui.item.setSelected) {
                ui.item.setSelected(false);
            }
            this.skill_ui = null;
            //回到原请求
            this.clearAllChild();
            this.start(this.originalRequest);
            return;
        }

        // 取消之前选中的技能
        if (this.skill_ui?.item?.setSelected) {
            this.skill_ui.item.setSelected(false);
        }

        // 选中新技能
        if (ui.item && ui.item.setSelected) {
            ui.item.setSelected(true);
        }
        this.skill_ui = ui;
        this.owner.selfseat.buttons.visible = false;
        const buttons: UIOptionButton[] = [];
        new Promise<string>((resolve, reject) => {
            if (
                handles.length === 1 &&
                handles[0] !== '#playphase_open_head' &&
                handles[0] !== '#playphase_open_deputy'
            ) {
                resolve(handles[0]);
            } else {
                this.owner.selfseat.prompt.text = `你要发动哪个效果`;
                this.owner.selfseat.buttons.visible = false;
                handles.forEach((v) => {
                    const btn = UIOptionButton.create(
                        this.game.getTranslation(
                            v.at(0) === '#' ? v : `@method:${v}`
                        )
                    );
                    this.owner.selfseat.options.addChild(btn);
                    btn.on(Laya.Event.CLICK, () => {
                        resolve(v);
                    });
                    buttons.push(btn);
                });
                const btn = UIOptionButton.create(
                    this.game.getTranslation('cancle')
                );
                this.owner.selfseat.options.addChild(btn);
                btn.item.onClick(() => {
                    resolve(undefined);
                });
                buttons.push(btn);
            }
        }).then((result) => {
            this.owner.selfseat.buttons.visible = true;
            this.owner.selfseat.prompt.text = '';
            this.owner.selfseat.options.children
                .slice()
                .forEach((v) => v.destroy());
            if (result === '#playphase_open_head') {
                this.request._use_or_play_vcard = undefined;
                this.request.result.selected_skill = undefined;
                this.request.result.playphase = PlayPhaseResule.OpenHead;
                this.onConfirmClick();
                return;
            }
            if (result === '#playphase_open_deputy') {
                this.request._use_or_play_vcard = undefined;
                this.request.result.selected_skill = undefined;
                this.request.result.playphase = PlayPhaseResule.OpenDeputy;
                this.onConfirmClick();
                return;
            }
            if (result === '#canclePreshow' && ui instanceof UISkillButton) {
                this.game.setPreshow(this.skill_ui as UISkillButton, false);
                this.skill_ui = undefined;
                return;
            }
            if (result === '#preshow' && ui instanceof UISkillButton) {
                this.game.setPreshow(this.skill_ui as UISkillButton, true);
                this.skill_ui = undefined;
                return;
            }
            if (result) {
                const req = reqs.find((v) => {
                    const effect = v.get_selectors.context.effect;
                    if (!effect) return false;
                    v.result.selected_skill = effect?.id;
                    if (
                        effect &&
                        (effect.data.name === result ||
                            effect.name === 'use_card' ||
                            effect.name === 'play_card')
                    ) {
                        const name =
                            this.originalRequest.get_selectors.selectorId
                                .split('.')
                                .at(-1);
                        if (
                            name &&
                            (name === 'use_card' || name === 'play_card') &&
                            (effect.inTrigger(EventTriggers.NeedPlayCard2) ||
                                effect.inTrigger(EventTriggers.NeedPlayCard3) ||
                                effect.inTrigger(EventTriggers.NeedUseCard2) ||
                                effect.inTrigger(EventTriggers.NeedUseCard3))
                        ) {
                            const selectors = {
                                selectorId:
                                    this.originalRequest.get_selectors
                                        .selectorId,
                                context: this.game.game.toData_Context(
                                    this.game.game.toJson_Context(
                                        this.originalRequest.get_selectors
                                            .context
                                    )
                                ),
                            };
                            selectors.context.card_selector = v.get_selectors;
                            selectors.context.target_selector = v.get_selectors;
                            selectors.context.options = v.options;
                            v.get_selectors = selectors;
                            this.game.game.fillRequest(v);
                        }
                        return true;
                    }
                });
                if (req) {
                    this.clearAllChild();
                    this.owner.frameOnce(1, this, () => {
                        this.start.call(this, req);
                    });
                }
            }
        });
    }
}
