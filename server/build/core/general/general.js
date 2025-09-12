"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.General = void 0;
class General {
    constructor(room, data) {
        this.data = data;
        /** 可见角色 */
        this.visibles = [];
        this.broadcastCustom = (data) => {
            this.room.markChanges.push({
                objType: 'general',
                objId: this.id,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        this.room = room;
        this.id = data.id;
        this.sourceData = {
            id: data.id,
            name: data.name,
            trueName: data.name.split('.').at(-1),
            kingdom: 'none',
            kingdom2: 'none',
            hp: 0,
            hpmax: 0,
            shield: 0,
            gender: data.gender,
            skills: data.skills.slice(),
            lord: data.lord,
            isDualImage: data.isDualImage,
            isWars: data.isWars ?? false,
            enable: data.enable,
            packages: data.package.slice(),
        };
        //kingdom
        if (Array.isArray(this.data.kingdom)) {
            this.sourceData.kingdom = this.data.kingdom[0];
            this.sourceData.kingdom2 = this.data.kingdom[1];
        }
        else {
            this.sourceData.kingdom = this.sourceData.kingdom2 =
                this.data.kingdom;
        }
        //hp
        if (Array.isArray(this.data.hp)) {
            this.sourceData.hp = this.data.hp[0];
            this.sourceData.hpmax = this.data.hp[1];
            this.sourceData.shield =
                this.data.hp.length > 2 ? this.data.hp[2] : 0;
        }
        else {
            this.sourceData.hp = this.sourceData.hpmax = this.data.hp;
            this.sourceData.shield = 0;
        }
    }
    /** 武将名 */
    get name() {
        return this.sourceData.name;
    }
    get trueName() {
        return this.sourceData.trueName;
    }
    /** 武将势力 */
    get kingdom() {
        return this.sourceData.kingdom;
    }
    /** 武将副势力 */
    get kingdom2() {
        return this.sourceData.kingdom2;
    }
    /** 初始体力值 */
    get hp() {
        return this.sourceData.hp;
    }
    /** 初始体力上限 */
    get hpmax() {
        return this.sourceData.hpmax;
    }
    /** 初始护盾 */
    get shield() {
        return this.sourceData.shield;
    }
    /** 武将性别 */
    get gender() {
        return this.sourceData.gender;
    }
    /** 武将技能 */
    get skills() {
        return this.sourceData.skills;
    }
    /** 是否为双势力武将 */
    isDual() {
        return this.kingdom !== this.kingdom2;
    }
    /** 是否与一张武将牌势力相同 */
    sameAs(to) {
        let thisKindom = [], toKingdom = [];
        if (this.isDual()) {
            thisKindom = [this.kingdom, this.kingdom2];
        }
        else {
            thisKindom = [this.kingdom];
        }
        if (to.isDual()) {
            toKingdom = [to.kingdom, to.kingdom2];
        }
        else {
            toKingdom = [to.kingdom];
        }
        return lodash.intersection(thisKindom, toKingdom).length > 0;
    }
    isShibing() {
        return this.name.includes('shibing');
    }
    isLord() {
        return this.sourceData.lord;
    }
    /** 获取资源地址 */
    getAssetsUrl(type) {
        let data = sgs.generalAssets[this.name];
        if (!data) {
            data = {
                image: `generals/${this.trueName}/image`,
                image_dual: `generals/${this.trueName}/image.dual`,
                image_self: `generals/${this.trueName}/image.dual/self`,
                death: `generals/${this.trueName}/death`,
            };
        }
        if (type === 'death') {
            return `${data.death}.mp3`;
        }
        if (type === 'image') {
            return `${data.image}.png`;
        }
        if (type === 'dual_image') {
            return `${data.image_dual}.png`;
        }
        if (type === 'self_image') {
            return `${data.image_self}.mp3`;
        }
    }
}
exports.General = General;
