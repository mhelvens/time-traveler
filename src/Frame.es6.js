import {assert}  from './util.es6.js';

import SpaceTime from './SpaceTime.es6.js';

const _tile = Symbol('_tile');

//
// A window to view the known information of a given space-time within given boundaries.
//
export default class Frame {

	constructor({spacetime, top, left, height, width, t}) {
		assert(() => spacetime instanceof SpaceTime);
		Object.assign(this, {spacetime, top, left, height, width, t});
	}

	[_tile](row, col, a) {
		return this.spacetime.getKnown(this.t, this.getX(col), this.getY(row), a);
	}

	getX(col) { return this.left + col }
	getY(row) { return this.top  + row }

	getKnown(row, col, a) {
		if (!(0 <= row && row <= this.height && 0 <= col && col < this.width)) { throw new RangeError() }
		return this[_tile](row, col, a);
	}

	getKnownAsMatrix(aspects) {
		let result = [];
		for (let row = 0; row < this.height; ++row) {
			result.push([]);
			for (let col = 0; col < this.width; ++col) {
				result[row].push({});
				for (let a of aspects) {
					result[row][col][a] = this[_tile](row, col, a);
				}
			}
		}

		return result;
	}

}
