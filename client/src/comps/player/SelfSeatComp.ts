import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UISelfSeat } from '../../ui/UISelfSeat';
import { PlayerComp } from './PlayerComp';

const { regClass, property } = Laya;

@regClass()
export class SelfSeatComp extends PlayerComp {
    declare owner: UISelfSeat;

    public isSelf: boolean = true;

    public tuoguan: boolean = false;

    public equips: UIEquipSelf[] = [];

    onAwake(): void {
        super.onAwake();

        this.equips.push(
            this.owner.equip31,
            this.owner.equip32,
            this.owner.equip33,
            this.owner.equip34,
            this.owner.equip35,
            this.owner.equip36
        );

        this.owner.item.onLongClick(() => {
            this.room.showPlayerInfo(this.player);
        });
    }

    public renderHead(): void {
        this.owner.general_head.setImage(this.head);
        this.owner.general_head.namebg.loadImage(
            `resources/room/texture/game/name/${
                this.head?.kingdom ?? 'qun'
            }.png`
        );
        // this.owner.general_head.name_icon.loadImage(
        //     `resources/room/texture/game/name/${
        //         this.head?.kingdom ?? 'qun'
        //     }.png`
        // );
        this.owner.general_head.gname.text = this.room.getTranslation(
            this.head?.trueName
        );
        this.owner.general_head.setQianfu(!this.headOpen, false);
    }
    public renderDeputy(): void {
        this.owner.general_deputy.setImage(this.deputy);
        this.owner.general_deputy.namebg.loadImage(
            `resources/room/texture/game/name/${
                this.deputy?.kingdom ?? 'qun'
            }.png`
        );
        // this.owner.general_deputy.name_icon.loadImage(
        //     `resources/room/texture/game/name/${
        //         this.deputy?.kingdom ?? 'qun'
        //     }.png`
        // );
        this.owner.general_deputy.gname.text = this.room.getTranslation(
            this.deputy?.trueName
        );
        this.owner.general_deputy.setQianfu(!this.deputyOpen, false);
    }
    protected setSeatSprite(): void {
        this.owner.seat.loadImage(
            `resources/room/texture/game/seat_num/self/${this.seat}.png`
        );
    }
    public renderKingdom(): void {
        if (this.camp_mode === 'kingdom') {
            let kingdom = this.kingdom.includes('ye') ? 'ye' : this.kingdom;
            const dashili = this.player.isBigKingdom();
            if (kingdom === 'none') {
                const g = this.head?.kingdom ?? this.deputy?.kingdom ?? 'qun';
                if (this.game.kingdomIsGreaterThenHalf(g, true)) {
                    kingdom = 'ye';
                } else {
                    kingdom = g;
                }
            }
            this.owner.kingdom.loadImage(
                `resources/room/texture/game/kingdom/${
                    dashili ? 'dashili/' : ''
                }${kingdom}.png`
            );
            this.owner.handcard.loadImage(
                `resources/room/texture/game/hand/${kingdom}.png`
            );
            this.owner.general_head.namebg.loadImage(
                `resources/room/texture/game/name/${kingdom}.png`
            );
            this.owner.general_deputy.namebg.loadImage(
                `resources/room/texture/game/name/${kingdom}.png`
            );
            this.owner.general_head.name_icon.loadImage(
                `resources/room/texture/game/selfseat/head.png`
            );
            this.owner.general_deputy.name_icon.loadImage(
                `resources/room/texture/game/selfseat/deputy.png`
            );
        } else {
            this.renderHead();
            this.renderDeputy();
        }
    }
    public setFrame(name: string, visible?: boolean): void {
        (this.owner.general_head as any)[name].visible = visible;
        (this.owner.general_deputy as any)[name].visible = visible;
    }

    public playFaceAni(ani: string, data?: any, addTo?: any): void {
        if (ani === 'fuhuo' || ani === 'huanfu') {
            const pos = data.pos;
            if (pos === 'head')
                super.playFaceAni(ani, data, this.owner.general_head);
            if (pos === 'deputy')
                super.playFaceAni(ani, data, this.owner.general_deputy);
            return;
        }
        super.playFaceAni(ani, data, addTo);
    }
}
