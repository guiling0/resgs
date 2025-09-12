import { CustomStringValue, MarkOptions, MarkValue } from './custom.type';

export class Custom {
    /** 不同对象需要实现不同的通知方法 */
    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void;

    public _data: { [key: string]: any } = {};
    public _mark: {
        [key: string]: { value: MarkValue; options: MarkOptions };
    } = {};

    setData<T extends any>(key: string, value: T): typeof this {
        if (!this._data) this._data = {};
        this._data[key] = value;
        return this;
    }

    getData<T extends any>(key: string): T {
        if (!this._data) this._data = {};
        return this._data[key];
    }

    removeData<T extends any>(key: string): T {
        if (!this._data) this._data = {};
        const data = this.getData<T>(key);
        delete this._data[key];
        return data;
    }

    setMark<T extends MarkValue>(
        key: string,
        value?: T,
        options?: MarkOptions
    ): typeof this {
        if (!this._mark) this._mark = {};
        if (this._mark[key]) {
            if (value !== undefined) this._mark[key].value = value;
            if (options) {
                this._mark[key].options = options;
            }
            this.broadcastCustom?.({
                key,
                value,
                options: {
                    visible: options?.visible ?? false,
                    values: options?.values,
                    type: options?.type,
                    areaId: options?.areaId,
                    url: options?.url,
                },
            });
        } else if (value !== undefined) {
            this._mark[key] = {
                value,
                options: options || { visible: false },
            };
            this.broadcastCustom?.({
                key,
                value,
                options: {
                    visible: options?.visible,
                    values: options?.values,
                    type: options?.type,
                    areaId: options?.areaId,
                    url: options?.url,
                },
            });
        }
        return this;
    }

    hasMark(key: string) {
        if (!this._mark) this._mark = {};
        return Reflect.has(this._mark, key);
    }

    getMark<T extends MarkValue>(key: string, defaultValue?: T): T {
        if (!this._mark) this._mark = {};
        return this._mark[key]?.value ?? defaultValue;
    }

    removeMark<T extends MarkValue>(key: string): T {
        if (!this._mark) this._mark = {};
        const data = this.getMark<T>(key);
        if (this.hasMark(key)) {
            delete this._mark[key];
            this.broadcastCustom?.({ key });
        }
        return data;
    }

    increaseMark(key: string, count: number = 1): number {
        if (this.hasMark(key)) {
            const data = this.getMark(key);
            if (typeof data === 'number') {
                this.setMark(key, data + count);
                return data + count;
            } else {
                return 0;
            }
        } else {
            this.setMark(key, count);
            return count;
        }
    }

    reduceMark(key: string, count: number = 1): number {
        return this.increaseMark(key, (count *= -1));
    }

    removeAllMark() {
        if (!this._mark) this._mark = {};
        Object.keys(this._mark).forEach((v) => {
            if (v.at(0) === '$') return;
            this.removeMark(v);
        });
    }

    getAllMark(): Omit<SetMark, 'type' | 'objType' | 'objId'>[] {
        if (!this._mark) this._mark = {};
        return Object.keys(this._mark).map((v) => {
            const data = this._mark[v];
            return {
                key: v,
                value: data.value,
                options: {
                    visible: data.options?.visible ?? false,
                    values: data.options?.values,
                },
            };
        });
    }
}

export type SetMark = {
    objType: 'player' | 'room' | 'card' | 'general' | 'skill' | 'effect';
    objId?: string | number;
    key: string;
    value?: MarkValue;
    options?: {
        visible?: boolean | string[];
        values?: CustomStringValue[];
        type?: string;
        areaId?: string;
        url?: string;
    };
};
