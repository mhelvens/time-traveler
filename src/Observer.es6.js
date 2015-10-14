import Time                                   from './Time.es6';
import {unknown, nothing, terrain}            from './symbols.es6.js';
import {last, chainIsDefined, abstractMethod} from './util.es6.js';

const _scaffoldObserved = Symbol('_scaffoldObserved');
const _scaffoldGuess    = Symbol('_scaffoldGuess');
const _observed         = Symbol('_observed');
const _guess            = Symbol('_guess');

//
// The base class for progressively specifying the content of a
// 4-dimensional reality as it is observed.
//
export class Observer {

	constructor(reality) {
		this[_observed] = new Map();
		this[_guess]    = {};
		this.reality  = reality;
	}

	[_scaffoldObserved](t, x, y, a) {
		if (!this[_observed].get(t))          { this[_observed].set(t           , {})     }
		if (!this[_observed].get(t)[x])       { this[_observed].get(t)[x]       = {}      }
		if (!this[_observed].get(t)[x][y])    { this[_observed].get(t)[x][y]    = {}      }
		if (!this[_observed].get(t)[x][y][a]) { this[_observed].get(t)[x][y][a] = unknown }
	}

	[_scaffoldGuess](t, x, y, a) {
		if (!this[_guess][x])       { this[_guess][x]       = {}      }
		if (!this[_guess][x][y])    { this[_guess][x][y]    = {}      }
		if (!this[_guess][x][y][a]) { this[_guess][x][y][a] = unknown }
	}

	getKnown(t, x, y, a) {
		if (!chainIsDefined(this[_observed], t, x, y, a)) { return unknown }
		return this[_observed].get(t)[x][y][a];
	}

	getGuess(t, x, y, a) {
		if (!chainIsDefined(this[_guess], x, y, a)) { return unknown }
		return this[_guess][x][y][a];
	}

	observe(t, x, y, a) {
		let reality = this.reality.getReality(t, x, y, a);
		if (reality === unknown) { return }
		if ([ unknown, reality ].includes( this.getKnown(t, x, y, a) )) {
			this[_scaffoldObserved](t, x, y, a);
			this[_scaffoldGuess]   (t, x, y, a);
			this[_observed].get(t)[x][y][a] =
			this[_guess]          [x][y][a] = reality;
			return t;
		} else {
			console.log('PARADOX:', this[_observed].get(t)[x][y][a], reality);
			let t2 = t.branch;
			this[_scaffoldObserved](t2, x, y, a);
			this[_scaffoldGuess]   (t2, x, y, a);
			this[_observed].get(t2)[x][y][a] =
			this[_guess]           [x][y][a] = reality;
			return t2;
		}
	}

	branchesOf(t) { return t.prev.successors }

	tile(t, x, y) {
		return {
			getKnown: (a)    => { return this.getKnown(t, x, y, a)    },
			getGuess: (a)    => { return this.getGuess(t, x, y, a)    }
		};
	}

}
