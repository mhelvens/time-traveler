import {unknown, nothing, terrain} from './symbols.es6.js';

const _scaffold = Symbol('_scaffold');
const _cache    = Symbol('_cache');

//
// The base class for progressively specifying the content of a
// 4-dimensional reality as it is observed.
//
export default class SpaceTime {

	constructor() {
		this[_cache] = {};
	}

	getReality() { throw new Error("SpaceTime subclasses needs to implement 'getReality'") }

	[_scaffold](t, x, y, a) {
		if (!this[_cache][t])          { this[_cache][t]          = {}      }
		if (!this[_cache][t][x])       { this[_cache][t][x]       = {}      }
		if (!this[_cache][t][x][y])    { this[_cache][t][x][y]    = {}      }
		if (!this[_cache][t][x][y][a]) { this[_cache][t][x][y][a] = unknown }
	}

	getKnown(t, x, y, a) {
		this[_scaffold](t, x, y, a);
		return this[_cache][t][x][y][a];
	}

	observe(t, x, y, a) {
		this[_scaffold](t, x, y, a);
		this[_cache][t][x][y][a] = this.getReality(t, x, y, a);
	}

}
