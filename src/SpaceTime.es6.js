import {unknown, nothing, terrain} from './symbols.es6.js';
import {last, chainIsDefined}      from './util.es6.js';

const _scaffold       = Symbol('_scaffold');
const _observed       = Symbol('_observed');
const _data           = Symbol('_data');
const _guess          = Symbol('_guess');
const _possibilities  = Symbol('_possibilities');
const _successors     = Symbol('_successors');
const _predecessor    = Symbol('_predecessor');
const _branch         = Symbol('_branch');

//
// The base class for progressively specifying the content of a
// 4-dimensional reality as it is observed.
//
export class SpaceTime {

	constructor() {
		this[_data]     = new Map();
		this[_observed] = new Map();
		this[_guess]    = {};

		//let thisST = this;
		this.State = class State {
			constructor({predecessor, successor, [_branch]: branch} = {}) {
				if (predecessor) {
					if (predecessor[_successors].length > 0 && !branch) {
						return last(predecessor[_successors]);
					}
					this[_predecessor] = predecessor;
					this[_successors]  = [];
					predecessor[_successors].push(this);
					this.time = predecessor.time + 1;
				} else if (successor) {
					if (successor[_predecessor]) {
						return successor[_predecessor];
					}
					successor[_predecessor] = this;
					this[_successors] = [successor];
					this.time = successor.time - 1;
				} else {
					this[_successors] = [];
					this.time = 0;
				}
			}
			[_branch]() { return new State({ predecessor: this[_predecessor], [_branch]: true }) }
			get next()  { return new State({ predecessor: this }) }
			get prev()  { return new State({ successor:   this }) }
			plus(dt) {
				/**/ if (dt  <  0) { return this.minus(-dt)        }
				else if (dt === 0) { return this                   }
				else /*         */ { return this.next.plus(dt - 1) }
			}
			minus(dt) {
				/**/ if (dt  <  0) { return this.plus(-dt)          }
				else if (dt === 0) { return this                    }
				else /*         */ { return this.prev.minus(dt - 1) }
			}
		};

		this[0] = new this.State();
	}

	getReality() { throw new Error("SpaceTime subclasses needs to implement 'getReality'") }

	[_scaffold](t, x, y, a) {
		if (!this[_data]    .has(t))          { this[_data]    .set(t,            {})     }
		if (!this[_data]    .get(t)[x])       { this[_data]    .get(t)[x]       = {}      }
		if (!this[_data]    .get(t)[x][y])    { this[_data]    .get(t)[x][y]    = {}      }
		if (!this[_observed].get(t))          { this[_observed].set(t,            {})     }
		if (!this[_observed].get(t)[x])       { this[_observed].get(t)[x]       = {}      }
		if (!this[_observed].get(t)[x][y])    { this[_observed].get(t)[x][y]    = {}      }
		if (!this[_observed].get(t)[x][y][a]) { this[_observed].get(t)[x][y][a] = unknown }
		if (!this[_guess]          [x])       { this[_guess]          [x]       = {}      }
		if (!this[_guess]          [x][y])    { this[_guess]          [x][y]    = {}      }
		if (!this[_guess]          [x][y][a]) { this[_guess]          [x][y][a] = unknown }
	}

	setData(t, x, y, a, val) {
		this[_scaffold](t, x, y, a);
		this[_data].get(t)[x][y][a] = val;
		return this;
	}

	getData(t, x, y, a) {
		if (!chainIsDefined(this[_data], t, x, y, a)) { return undefined }
		this[_scaffold](t, x, y, a);
		return this[_data].get(t)[x][y][a];
	}

	getKnown(t, x, y, a) {
		if (!chainIsDefined(this[_observed], t, x, y, a)) { return unknown }
		this[_scaffold](t, x, y, a);
		return this[_observed].get(t)[x][y][a];
	}

	getGuess(t, x, y, a) {
		if (!chainIsDefined(this[_guess], x, y, a)) { return unknown }
		this[_scaffold](t, x, y, a);
		return this[_guess][x][y][a];
	}

	observe(t, x, y, a) {
		let reality = this.getReality(t, x, y, a);
		if (reality === unknown) { return }
		this[_scaffold](t, x, y, a);
		if ([ unknown, reality ].includes( this[_observed].get(t)[x][y][a]) ) {
			this[_observed].get(t)[x][y][a] =
			this[_guess]          [x][y][a] = reality;
			return t;
		} else {
			console.log('PARADOX:', this[_observed].get(t)[x][y][a], reality);
			let t2 = t[_branch]();
			this[_scaffold](t2, x, y, a);
			this[_observed].get(t2)[x][y][a] =
			this[_guess]           [x][y][a] = reality;
			return t2;
		}
	}

	branchesOf(t) { return t.prev[_successors] }

	tile(t, x, y) {
		return {
			getKnown: (a)    => { return this.getKnown(t, x, y, a)    },
			getData:  (a)    => { return this.getData (t, x, y, a)    },
			setData:  (a, v) => { return this.setData (t, x, y, a, v) },
			getGuess: (a)    => { return this.getGuess(t, x, y, a)    }
		};
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
