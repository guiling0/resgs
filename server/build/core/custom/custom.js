"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Custom = void 0;
class Custom {
    constructor() {
        this._data = {};
        this._mark = {};
    }
    setData(key, value) {
        if (!this._data)
            this._data = {};
        this._data[key] = value;
        return this;
    }
    getData(key) {
        if (!this._data)
            this._data = {};
        return this._data[key];
    }
    removeData(key) {
        if (!this._data)
            this._data = {};
        const data = this.getData(key);
        delete this._data[key];
        return data;
    }
    setMark(key, value, options) {
        if (!this._mark)
            this._mark = {};
        if (this._mark[key]) {
            if (value !== undefined)
                this._mark[key].value = value;
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
        }
        else if (value !== undefined) {
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
    hasMark(key) {
        if (!this._mark)
            this._mark = {};
        return Reflect.has(this._mark, key);
    }
    getMark(key, defaultValue) {
        if (!this._mark)
            this._mark = {};
        return this._mark[key]?.value ?? defaultValue;
    }
    removeMark(key) {
        if (!this._mark)
            this._mark = {};
        const data = this.getMark(key);
        if (this.hasMark(key)) {
            delete this._mark[key];
            this.broadcastCustom?.({ key });
        }
        return data;
    }
    increaseMark(key, count = 1) {
        if (this.hasMark(key)) {
            const data = this.getMark(key);
            if (typeof data === 'number') {
                this.setMark(key, data + count);
                return data + count;
            }
            else {
                return 0;
            }
        }
        else {
            this.setMark(key, count);
            return count;
        }
    }
    reduceMark(key, count = 1) {
        return this.increaseMark(key, (count *= -1));
    }
    removeAllMark() {
        if (!this._mark)
            this._mark = {};
        Object.keys(this._mark).forEach((v) => {
            if (v.at(0) === '$')
                return;
            this.removeMark(v);
        });
    }
    getAllMark() {
        if (!this._mark)
            this._mark = {};
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
exports.Custom = Custom;
