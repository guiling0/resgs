import { ICardData, CardItemView } from "./CardItemView";

export class CardPool {
    private static _pool: Laya.Sprite[] = [];
    private static _prefab: Laya.Prefab;

    static async init(): Promise<void> {
        this._prefab = await Laya.loader.load("resources/prefabs/Card.lh");
    }

    static get(data: ICardData): Laya.Sprite | null {
        let node: Laya.Sprite;

        if (this._pool.length > 0) {
            node = this._pool.pop();
            node.visible = true;
        } else {
            if (!this._prefab) {
                console.error("[CardPool] not initialized, call CardPool.init() first");
                return null;
            }
            node = this._prefab.create() as Laya.Sprite;
        }

        const view = node.getComponent(CardItemView);
        if (view) view.updateView(data);

        return node;
    }

    static recycle(node: Laya.Sprite): void {
        const view = node.getComponent(CardItemView);
        if (view) view.reset();

        if (node.parent) node.removeSelf();

        this._pool.push(node);
    }

    static clear(): void {
        for (const n of this._pool) n.destroy();
        this._pool.length = 0;
    }
}
