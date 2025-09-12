import Pako from 'pako';

export class Replay {
    private static instance: Replay;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Replay();
        }
        return this.instance;
    }

    private dbName: string = 'GameReplayDB';
    private storeName: string = 'replays';
    private db: IDBDatabase | null = null;
    private version: number = 1;

    private constructor() {}

    public async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve();
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('timestamp', 'timestamp', {
                        unique: false,
                    });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onerror = (event) => {
                reject(
                    `IndexedDB打开失败: ${
                        (event.target as IDBOpenDBRequest).error
                    }`
                );
            };
        });
    }

    public async saveReplay(replayData: any): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                this.storeName,
                'readwrite'
            );
            const store = transaction.objectStore(this.storeName);

            const replay = {
                data: Pako.gzip(JSON.stringify(replayData)),
                timestamp: Date.now(),
                name: replayData.name,
            };

            const request = store.add(replay);

            request.onsuccess = () => {
                resolve(request.result as number); // 返回记录的ID
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async getAllReplayMeta(): Promise<Array<any>> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                this.storeName,
                'readonly'
            );
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.getAll();

            request.onsuccess = () => {
                // 只返回元数据，不包含大数据体
                const result = request.result.map((item) => ({
                    id: item.id,
                    timestamp: item.timestamp,
                    name: item.name,
                }));
                resolve(result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async getRelayById(id: number): Promise<any> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                this.storeName,
                'readonly'
            );
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    reject(new Error('未找到指定ID的录像'));
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 删除录像
    public async deleteReplay(id: number): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                this.storeName,
                'readwrite'
            );
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 清空所有录像
    public async clearAllReplays(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                this.storeName,
                'readwrite'
            );
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 获取数据库大小估算
    public async getDatabaseSize(): Promise<{ usage: number; quota: number }> {
        if (navigator.storage && navigator.storage.estimate) {
            return navigator.storage.estimate() as any;
        }
        return Promise.resolve({ usage: 0, quota: 0 });
    }
}
