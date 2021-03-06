import Time                   from './Time.es6.js';
import DeepMap                from './DeepMap.es6.js';
import {last, chainIsDefined} from './util.es6.js';

const _observed         = Symbol('_observed');
const _guess            = Symbol('_guess');

// The base class for progressively specifying the content of a
// 4-dimensional reality as it is observed.
//
export class Observer {

	constructor(reality) {
		this[_observed] = new DeepMap({ depth: 4 });
		this[_guess]    = new DeepMap({ depth: 3 });
		this.reality    = reality;
	}

	getKnown(t, x, y, a) {
		return this[_observed].get(t, x, y, a);
	}

	getGuess(t, x, y, a) {
		return this[_guess].get(x, y, a);
	}

	observe(t, x, y, a) {
		let reality = this.reality.getReality(t, x, y, a);
		if (!reality) { return }
		let tt;
		if (this.getKnown(t, x, y, a) === reality || !this.getKnown(t, x, y, a)) {
			tt = t;
		} else {
			console.log('PARADOX:', this[_observed].get(t, x, y, a), reality);
			tt = t.branch();
		}
		this[_observed].set(tt, x, y, a, reality);
		this[_guess]   .set(    x, y, a, reality);
		return tt;
	}

	branchesOf(t) { return t.prev.successors }

	tile(t, x, y) {
		return {
			getKnown: (a)    => { return this.getKnown(t, x, y, a)    },
			getGuess: (a)    => { return this.getGuess(t, x, y, a)    },
			t, x, y
		};
	}

}
