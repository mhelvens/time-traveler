import {unknown, nothing, terrain} from './symbols.es6.js';

const _scaffold       = Symbol('_scaffold');
const _observed       = Symbol('_observed');
const _data           = Symbol('_data');
const _lastRemembered = Symbol('_lastRemembered');
const _possibilities  = Symbol('_possibilities');

//
// The base class for progressively specifying the content of a
// 4-dimensional reality as it is observed.
//
export class SpaceTime {

	constructor() {
		this[_data]           = {};
		this[_observed]       = {};
		this[_lastRemembered] = {};
	}

	getReality() { throw new Error("SpaceTime subclasses needs to implement 'getReality'") }

	[_scaffold](t, x, y, a) {
		if (!this[_data]       [t])          { this[_data]       [t]          = {}        }
		if (!this[_data]       [t][x])       { this[_data]       [t][x]       = {}        }
		if (!this[_data]       [t][x][y])    { this[_data]       [t][x][y]    = {}        }
		if (!this[_data]       [t][x][y][a]) { this[_data]       [t][x][y][a] = undefined }
		if (!this[_observed]   [t])          { this[_observed]   [t]          = {}        }
		if (!this[_observed]   [t][x])       { this[_observed]   [t][x]       = {}        }
		if (!this[_observed]   [t][x][y])    { this[_observed]   [t][x][y]    = {}        }
		if (!this[_observed]   [t][x][y][a]) { this[_observed]   [t][x][y][a] = unknown   }
		if (!this[_lastRemembered][x])       { this[_lastRemembered][x]       = {}        }
		if (!this[_lastRemembered][x][y])    { this[_lastRemembered][x][y]    = {}        }
		if (!this[_lastRemembered][x][y][a]) { this[_lastRemembered][x][y][a] = unknown   }
	}

	setData(t, x, y, a, val) {
		this[_scaffold](t, x, y, a);
		this[_data][t][x][y][a] = val;
		return this;
	}

	getData(t, x, y, a) {
		this[_scaffold](t, x, y, a);
		return this[_data][t][x][y][a];
	}

	getKnown(t, x, y, a) {
		this[_scaffold](t, x, y, a);
		return this[_observed][t][x][y][a];
	}

	getLastRemembered(t, x, y, a) {
		this[_scaffold](t, x, y, a);
		return this[_lastRemembered][x][y][a];
	}

	observe(t, x, y, a) {
		this[_scaffold](t, x, y, a);

		let reality = this.getReality(t, x, y, a);
		if (this[_observed][t][x][y][a] === unknown || this[_observed][t][x][y][a] === reality) {
			this[_observed]   [t][x][y][a] =
			this[_lastRemembered][x][y][a] = reality;
		} else { // PARADOX!
			console.log('PARADOX:', this[_observed][t][x][y][a], reality);
			if (this[_observed][t][x][y][a] instanceof Paradox) {
				this[_observed][t][x][y][a].observed(reality);
			} else {
				this[_observed][t][x][y][a] = new Paradox()
					.observed(this[_observed][t][x][y][a])
					.observed(reality);
			}
			this[_lastRemembered][x][y][a] = this[_observed][t][x][y][a];
		}

	}

}

export class Paradox {
	constructor() {
		this[_possibilities] = [];
	}
	observed(v) {
		if (typeof v === 'undefined') {
			return this[_possibilities];
		} else {
			this[_possibilities].push(v);
			return this;
		}
	}
}
