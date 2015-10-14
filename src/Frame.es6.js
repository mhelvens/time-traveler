import {assert}  from './util.es6.js';

import {Observer} from './Observer.es6.js';
import GridMap    from './GridMap.es6';

//
// A window to view the known information of a given space-time within given boundaries.
//
export default class Frame { // TODO: inherit from GridMap and redo interface accordingly

	observer;

	constructor({observer, top, left, height, width, t}) {
		assert(() => observer instanceof Observer);
		Object.assign(this, { observer, top, left, height, width, t });
	}

	getX(col) { return this.left + col }
	getY(row) { return this.top  + row }

	getKnown(row, col, a) {
		if (!(0 <= row && row <= this.height && 0 <= col && col < this.width)) { throw new RangeError() }
		return this.observer.getKnown(this.t, this.getX(col), this.getY(row), a);
	}

}
