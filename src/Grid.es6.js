import GridMap from './GridMap.es6.js';
import {defOr} from './util.es6';

const _e        = Symbol('_e');
const _grid     = Symbol('_grid');

//
// an easy way to specify a map-grid laid out in ascii
//
export default class Grid extends GridMap {

	constructor(ascii, options = {}) {
		super();
		options = Object.assign({ ' ': null, anchor: '@', direction: 'right' }, options);
		this.anchorD(options.direction);
		this[_e] = options[' '];
		this[_grid] = [[]];
		let row = 0, col = 0;
		let anchorSet = false;
		for (let c of ascii) {
			if (c === '\n') {
				this[_grid].push([]);
				row += 1;
				col = -1;
			} else {
				if (c === options.anchor) {
					this.anchorRowCol(row, col);
					anchorSet = true;
				}
				this[_grid][row].push(defOr(options[c], null));
			}
			col += 1;
		}
		if (!anchorSet) { throw new Error(`This grid does not contain an anchor '${options.anchor}'.`) }
	}

	get(x, y) {
		let [row, col] = this.toRowCol(x, y);
		return (this[_grid][row] && typeof this[_grid][row][col] !== 'undefined')
			? this[_grid][row][col]
			: this[_e];
	}

	forEach(cb) {
		for (let row = 0; row < this[_grid].length; ++row) {
			for (let col = 0; col < this[_grid][row].length; ++col) {
				let [x, y] = this.toXY(row, col);
				cb(x, y, this.get(x, y));
			}
		}
		return this;
	}

}
