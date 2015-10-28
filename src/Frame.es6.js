import {assert}  from './util.es6.js';

import {Observer} from './Observer.es6.js';
import GridMap    from './GridMap.es6';

//
// A window to view the known information of a given space-time within given boundaries.
//
export default class Frame extends GridMap {

	observer;

	constructor({observer, height, width, t}) {
		super();
		assert(() => observer instanceof Observer);
		Object.assign(this, { observer, height, width, t });
		this.anchorRowCol(
			Math.floor(height / 2),
			Math.floor(width  / 2)
		);
	}

	rowColInFrame(row, col) {
		return 0 <= row && row < this.height && 0 <= col && col < this.width;
	}

	xyInFrame(x, y) {
		return this.rowColInFrame(...this.toRowCol(x, y));
	}

	tile(row, col) {
		if (!this.rowColInFrame(row, col)) { throw new RangeError() }
		return this.observer.tile(this.t, ...this.toXY(row, col));
	}

}
