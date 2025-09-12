import { GameCard } from '../../core/card/card';
import { CardPut } from '../../core/card/card.types';
import { General } from '../../core/general/general';
import { MsgWindow } from '../../core/message/message.window';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { UIWindow } from '../../ui/UIWindow';
import { RoomGameComp } from './RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export class GameWindowComp extends Laya.Script {
    declare owner: UIGameRoom;

    public game: RoomGameComp;

    onAwake(): void {
        this.game = this.owner.getComponent(RoomGameComp);
    }

    public windows: UIWindow[] = [];

    public serverWindow(_data: MsgWindow) {
        const { options, data, create, close } = _data;
        if (!options?.id) return;
        let window = this.getWindow(options.id);
        if (close) {
            this.close(window);
            return;
        }
        if (create && !window) {
            window = UIWindow.create(this.game, options);
            window.isActiveClinet = false;
            this.open(window);
        }
        if (window) {
            if (data) {
                if (data.type === 'datas') {
                    window.setDatas(data.cards);
                }
                if (data.type === 'rows') {
                    window.setDatas(data.datas);
                }
                if (data.type === 'items') {
                    window.setItems(data.datas);
                }
            }
            window.setOptions(options);
        }
    }

    public open(window: UIWindow) {
        if (!window) return;
        if (window.parent === this.owner.windows) return;
        this.owner.windows.addChild(window);
        this.windows.push(window);
    }

    public close(window: UIWindow) {
        window?.destroy();
        lodash.remove(this.windows, (w) => w === window);
    }

    public getWindow(id: number) {
        if (id === undefined) return;
        return this.windows.find((v) => v.id === id);
    }

    public showCardsWindow(
        title: string,
        cards: (GameCard | General | number)[]
    ) {
        if (this.windows.find((v) => v.title.text === title)) return;
        const window = UIWindow.create(this.game, {
            title,
            showCloseButton: true,
        });
        window.setDatas(cards);
        this.open(window);
    }

    public showReserveWindow(title: string) {
        if (this.windows.find((v) => v.title.text === title)) return;
        const window = UIWindow.create(this.game, {
            title,
            showCloseButton: true,
        });
        window.setRows(this.game.game.getReserveRowDatas());
        this.open(window);
    }
}
