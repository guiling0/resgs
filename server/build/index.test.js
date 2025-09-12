"use strict";
const id = 'a.b.c.d';
const sp = id.split('.');
const _name = sp.at(-1);
console.log(_name);
const effect = id.slice(0, id.length - _name.length - 1);
console.log(effect);
