import { General } from '../../core/general/general';
import { UISeat } from '../../ui/UISeat';
import { PlayerComp } from './PlayerComp';

const { regClass, property } = Laya;

@regClass()
export class SeatComp extends PlayerComp {
    declare owner: UISeat;

    onAwake(): void {
        super.onAwake();

        this.owner.menu.mouseThrough = false;
        this.owner.item.onLongClick(() => {
            this.owner.menu.visible = true;
        });

        this.owner.player_info.on(Laya.Event.CLICK, this, () => {
            this.room.showPlayerInfo(this.player);
            this.hideMenu();
        });
        this.owner.menu_close.on(Laya.Event.CLICK, this, () => {
            this.hideMenu();
        });

        this.owner.egg.on(Laya.Event.CLICK, this, () => {
            if (this.room.self && !this.room.spectate) {
                this.room.table.sendChat(
                    `@throw:${JSON.stringify({
                        type: 'egg',
                        from: this.room.self.playerId,
                        to: this.player.playerId,
                    })}`
                );
                this.owner.clearTimer(this, this.hideMenu);
                this.owner.timerOnce(1000, this, this.hideMenu);
            }
        });
        this.owner.flower.on(Laya.Event.CLICK, this, () => {
            if (this.room.self && !this.room.spectate) {
                this.room.table.sendChat(
                    `@throw:${JSON.stringify({
                        type: 'flower',
                        from: this.room.self.playerId,
                        to: this.player.playerId,
                    })}`
                );
                this.owner.clearTimer(this, this.hideMenu);
                this.owner.timerOnce(1000, this, this.hideMenu);
            }
        });

        this.owner.handbg.on(Laya.Event.CLICK, () => {
            if (this.player) {
                this.room.window.showCardsWindow(
                    `${this.player.gameName}的手牌`,
                    this.player.handArea.cards
                );
            }
        });

        this.owner.menu_jubao.on(Laya.Event.CLICK, () => {
            if (this.player) {
                this.room.jubao(this.player.username);
            }
        });

        this.owner.menu_pingbi.on(Laya.Event.CLICK, () => {
            if (this.player) {
                this.room.pingbi(this.player.username);
            }
        });
    }

    public hideMenu() {
        this.owner.menu.visible = false;
    }

    public renderHead(): void {
        const his_generals =
            this.player.room.getData<Set<General>>('watch_generals');
        if (this.headOpen || his_generals?.has(this.head)) {
            this.owner.general_single.setImage(this.head);
            this.owner.general_head.setImage(this.head);
            this.owner.general_single.qianfu.visible = !this.headOpen;
            this.owner.general_head.qianfu.visible = !this.headOpen;
            if (this.player.general_mode === 'single') {
                this.owner.name_bg.loadImage(
                    `resources/room/texture/game/name/${this.player.kingdom}.png`
                );
                this.owner.name_icon.loadImage(
                    `resources/card/texture/general/kingdom/${this.player.kingdom}.png`
                );
                this.owner.gname.text = this.room.getTranslation(
                    this.head?.trueName
                );
                this.owner.general_head.gname.text = ``;
            } else {
                this.owner.general_head.gname.text = this.room.getTranslation(
                    this.head?.trueName
                );
            }
        } else {
            this.owner.general_single.setImage(null);
            this.owner.general_head.setImage(null);
            this.owner.name_bg.loadImage(
                `resources/room/texture/game/name/qun.png`
            );
            this.owner.name_icon.texture = undefined;
            this.owner.gname.text = '主将';
            this.owner.general_head.gname.text = '主将';
            if (this.player.general_mode === 'single') {
            } else {
            }
            this.owner.general_single.qianfu.visible = false;
            this.owner.general_head.qianfu.visible = false;
        }
    }
    public renderDeputy(): void {
        const his_generals =
            this.player.room.getData<Set<General>>('watch_generals');
        if (this.deputyOpen || his_generals?.has(this.deputy)) {
            this.owner.general_deputy.setImage(this.deputy);
            this.owner.general_deputy.qianfu.visible = !this.deputyOpen;
            this.owner.general_deputy.gname.text = this.room.getTranslation(
                this.deputy?.trueName
            );
        } else {
            this.owner.general_deputy.setImage(null);
            this.owner.general_deputy.gname.text = '副将';
            this.owner.general_deputy.qianfu.visible = false;
        }
    }
    protected setSeatSprite(): void {
        this.owner.seat.loadImage(
            `resources/room/texture/game/seat_num/${this.seat}.png`
        );
    }
    public renderKingdom(): void {
        if (this.camp_mode === 'kingdom') {
            if (this.kingdom === 'none') {
                this.owner.kingdom.visible = false;
                this.owner.guozhan_marks.visible = true;
                this.owner.handcard.loadImage(
                    'resources/room/texture/game/hand/qun.png'
                );
            } else {
                this.owner.kingdom.visible = true;
                this.owner.guozhan_marks.visible = false;
                const kingdom = this.player.isYexinjia() ? 'ye' : this.kingdom;
                const dashili = this.player.isBigKingdom();
                this.owner.kingdom.loadImage(
                    `resources/room/texture/game/kingdom/${
                        dashili ? 'dashili/' : ''
                    }${kingdom}.png`
                );
                this.owner.handcard.loadImage(
                    `resources/room/texture/game/hand/${kingdom}.png`
                );
            }
        } else {
            this.renderHead();
            this.renderDeputy();
        }
    }
    public setFrame(name: string, visible?: boolean): void {
        if ((this.owner as any)[name]) {
            (this.owner as any)[name].visible = visible;
        }
    }
}
