export type ObjectPoolItem = Laya.Sprite & {
    onGet?(): void;
    onRet?(): void;
};
