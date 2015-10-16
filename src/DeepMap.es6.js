import {last, chainIsDefined, abstractMethod} from './util.es6.js';

const _data         = Symbol('_data');
const _depth        = Symbol('_depth');
const _defaultValue = Symbol('_defaultValue');
export default class DeepMap {
	constructor({ depth, defaultValue }) {
		this[_depth]        = depth;
		this[_defaultValue] = defaultValue;
		this[_data]         = new Map();
	}

	get(...coords) {
		let val = this[_data];
		for (let c of coords) {
			if (!val.has(c)) { return this[_defaultValue] }
			val = val.get(c);
		}
		return val;
	}

	has(...coords) {
		let obj = this[_data];
		for (let c of coords) {
			if (!obj.has(c)) { return false }
			obj = obj.get(c);
		}
		return true;
	}

	set(...coordsAndVal) {
		let val    = coordsAndVal.pop();
		let lastC  = coordsAndVal.pop();
		let coords = coordsAndVal;
		let map    = this[_data];
		for (let c of coords) {
			if (!map.has(c)) { map.set(c, new Map()) }
			map = map.get(c);
		}
		map.set(lastC, val);
	}
}
