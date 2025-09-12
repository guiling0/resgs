import { General } from '../../general/general';
import { GeneralId } from '../../general/general.type';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../room';

export class RoomGeneralMixin {
    /** 获取武将牌 */
    public getGeneral(this: GameRoom, id: GeneralId): General {
        return this.generals.get(id);
    }
    /** 获取一组武将牌 */
    public getGenerals(this: GameRoom, ids: GeneralId[] = []) {
        return ids.map((v) => this.getGeneral(v)).filter((v) => v) ?? [];
    }
    /** 获取一组武将牌的ID */
    public getGeneralIds(this: GameRoom, generals: General[]) {
        return generals?.map((v) => v.id) ?? [];
    }
    /** 从武将牌堆中获得所有指定名字的武将牌 */
    public getGeneralByName(this: GameRoom, name: string): General[] {
        return this.generalArea.generals.filter((v) => v.trueName === name);
    }

    /** 记录武将 */
    public recordGeneral(
        this: GameRoom,
        generalId: string,
        records: (
            | 'isOffered'
            | 'isInitialPick'
            | 'isChangePick'
            | 'isRemovals'
            | 'isWin'
            | 'isHead'
            | 'isDeputy'
        )[]
    ) {
        if (!this.generalsRecords[generalId]) {
            this.generalsRecords[generalId] = { generalId } as any;
        }
        records.forEach((v) => {
            this.generalsRecords[generalId][v] = true;
        });
    }

    /** 给所有玩家分配备选武将 */
    public async allocateGenerals(this: GameRoom) {
        const count = this.options.chooseGeneralCount * this.playerCount;
        if (this.generalNames.length < count) {
            await this.gameOver([], 'InsufficientQuantityGeneral');
            return undefined;
        }
        const names = sgs.utils.shuffle(this.generalNames).slice();
        this.generalArea.shuffle();
        const map = new Map<GamePlayer | 'unUse', string[]>();
        for (const player of this.players) {
            const selectable: string[] = [];
            for (let a = 0; a < this.options.chooseGeneralCount; a++) {
                if (player.prechooses && player.prechooses.length) {
                    const name = player.prechooses.shift();
                    const index = names.indexOf(name);
                    if (index !== -1) {
                        selectable.push(name);
                        lodash.remove(names, (v) => v === name);
                        continue;
                    }
                }
                const name = names.shift();
                selectable.push(name);
            }
            map.set(
                player,
                selectable.map((v) => {
                    const gs = this.getGeneralByName(v);
                    const id = gs[sgs.utils.randomInt(0, gs.length - 1)].id;
                    this.recordGeneral(id, ['isOffered']);
                    return id;
                })
            );
        }
        map.set('unUse', names);
        return map;
    }
}
